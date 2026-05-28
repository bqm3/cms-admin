import React, { useEffect, useMemo, useState } from "react";
import { useNode } from "@craftjs/core";
import axios from "axios";

type ViewMode = "card" | "table";
type HttpMethod = "GET" | "POST";

interface DynamicApiListProps {
  url: string;
  method: HttpMethod;
  token?: string;
  payload?: string;
  title?: string;
  viewMode?: ViewMode;
  columns?: string;
  background?: string;
  textColor?: string;
  borderColor?: string;
  radius?: number;
  padding?: number;

  // pagination
  pageSize?: number;
  initialPage?: number;
  showPagination?: boolean;
  showReloadButton?: boolean;
  autoFetch?: boolean;

  // search fields
  searchFields?: string;
}

function safeJsonParse(input?: string) {
  if (!input?.trim()) return {};
  try {
    return JSON.parse(input);
  } catch {
    return {};
  }
}

function extractRows(responseData: any): Record<string, any>[] {
  if (!responseData) return [];

  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.Data)) return responseData.Data;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.results)) return responseData.results;

  if (responseData?.Data && typeof responseData.Data === "object") {
    for (const key of Object.keys(responseData.Data)) {
      if (Array.isArray(responseData.Data[key])) {
        return responseData.Data[key];
      }
    }
  }

  return [];
}

function extractTotalRecords(responseData: any, fallbackLength = 0): number {
  const candidates = [
    responseData?.TotalRecords,
    responseData?.totalRecords,
    responseData?.total,
    responseData?.Total,
    responseData?.Data?.TotalRecords,
    responseData?.Data?.totalRecords,
    responseData?.pagination?.total,
    responseData?.meta?.total,
  ];

  for (const x of candidates) {
    const n = Number(x);
    if (!Number.isNaN(n) && n >= 0) return n;
  }

  return fallbackLength;
}

function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// ─── Export helpers ───────────────────────────────────────────────────────────
function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob(["\uFEFF" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV(rows: Record<string, any>[], cols: string[], filename = "export") {
  const escape = (v: any) => {
    const s = formatValue(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const header = cols.join(",");
  const body = rows.map((r) => cols.map((c) => escape(r[c])).join(",")).join("\n");
  downloadBlob(header + "\n" + body, `${filename}.csv`, "text/csv;charset=utf-8");
}

function exportXML(rows: Record<string, any>[], cols: string[], filename = "export") {
  const escXml = (v: any) =>
    formatValue(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const items = rows
    .map(
      (r) =>
        "  <Row>\n" +
        cols.map((c) => `    <${c}>${escXml(r[c])}</${c}>`).join("\n") +
        "\n  </Row>"
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Data>\n${items}\n</Data>`;
  downloadBlob(xml, `${filename}.xml`, "application/xml;charset=utf-8");
}

function exportJSON(rows: Record<string, any>[], cols: string[], filename = "export") {
  const filtered = rows.map((r) =>
    Object.fromEntries(cols.map((c) => [c, r[c] ?? null]))
  );
  downloadBlob(JSON.stringify(filtered, null, 2), `${filename}.json`, "application/json;charset=utf-8");
}

// ─── ExportMenu component ─────────────────────────────────────────────────────
const ExportMenu: React.FC<{
  rows: Record<string, any>[];
  cols: string[];
  title: string;
  borderColor: string;
  textColor: string;
}> = ({ rows, cols, title, borderColor, textColor }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const actions = [
    {
      label: "📊 Export Excel (CSV)",
      onClick: () => { exportCSV(rows, cols, title); setOpen(false); },
    },
    {
      label: "📄 Export XML",
      onClick: () => { exportXML(rows, cols, title); setOpen(false); },
    },
    {
      label: "{ } Export JSON",
      onClick: () => { exportJSON(rows, cols, title); setOpen(false); },
    },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 12px",
          fontSize: 13,
          borderRadius: 6,
          border: `1px solid ${borderColor}`,
          background: "transparent",
          color: textColor,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        ⬇ Export
        <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            zIndex: 999,
            minWidth: 190,
            background: "#fff",
            border: `1px solid ${borderColor}`,
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
              }
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "9px 14px",
                fontSize: 13,
                background: "transparent",
                border: "none",
                color: "#111827",
                cursor: "pointer",
                borderBottom: `1px solid #f3f4f6`,
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function buildPayload(
  basePayload: Record<string, any>,
  pageIndex: number,
  pageSize: number,
  searchFieldValues: Record<string, string> = {}
) {
  const mergedSearchField = {
    ...(basePayload.SEARCH_FIELD || {}),
    ...Object.fromEntries(
      Object.entries(searchFieldValues).filter(([, v]) => v.trim() !== "")
    ),
  };

  return {
    ...basePayload,
    ...(Object.keys(mergedSearchField).length > 0
      ? { SEARCH_FIELD: mergedSearchField }
      : {}),
    PAGE_INDEX: String(pageIndex),
    PAGE_SIZE: String(pageSize),
  };
}

export const DynamicApiListComponent: React.FC<DynamicApiListProps> & {
  craft?: any;
} = ({
  url,
  method = "POST",
  token = "",
  payload = "",
  title = "Dynamic API List",
  viewMode = "card",
  columns = "",
  background = "#ffffff",
  textColor = "#111827",
  borderColor = "#e5e7eb",
  radius = 12,
  padding = 16,
  pageSize = 20,
  initialPage = 1,
  showPagination = true,
  showReloadButton = true,
  autoFetch = true,
  searchFields = "",
}) => {
    const {
      connectors: { connect, drag },
      selected,
    } = useNode((node) => ({
      selected: node.events.selected,
    }));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rows, setRows] = useState<Record<string, any>[]>([]);
    const [raw, setRaw] = useState<any>(null);

    const [pageIndex, setPageIndex] = useState(initialPage || 1);
    const [currentPageSize, setCurrentPageSize] = useState(pageSize || 20);
    const [totalRecords, setTotalRecords] = useState(0);

    // Dynamic search field values
    const parsedSearchFields = useMemo(() => {
      if (!searchFields?.trim()) return [];
      return searchFields
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }, [searchFields]);

    // Live values while typing (does NOT trigger API)
    const [searchFieldValues, setSearchFieldValues] = useState<Record<string, string>>({});
    // Committed values — only updated when user clicks Search / presses Enter
    const [committedSearchValues, setCommittedSearchValues] = useState<Record<string, string>>({});

    // Reset both when field list changes
    useEffect(() => {
      const reset = (prev: Record<string, string>) => {
        const next: Record<string, string> = {};
        parsedSearchFields.forEach((f) => {
          next[f] = prev[f] ?? "";
        });
        return next;
      };
      setSearchFieldValues(reset);
      setCommittedSearchValues(reset);
    }, [searchFields]);

    const parsedPayload = useMemo(() => safeJsonParse(payload), [payload]);

    // finalPayload uses committedSearchValues — never updates from live typing
    const finalPayload = useMemo(() => {
      return buildPayload(parsedPayload, pageIndex, currentPageSize, committedSearchValues);
    }, [parsedPayload, pageIndex, currentPageSize, committedSearchValues]);

    const totalPages = useMemo(() => {
      if (!currentPageSize || currentPageSize <= 0) return 1;
      return Math.max(1, Math.ceil(totalRecords / currentPageSize));
    }, [totalRecords, currentPageSize]);

    const displayColumns = useMemo(() => {
      if (columns.trim()) {
        return columns
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }

      if (rows.length > 0) return Object.keys(rows[0]);
      return [];
    }, [columns, rows]);

    const fetchData = async () => {
      if (!url?.trim()) return;

      try {
        setLoading(true);
        setError("");

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          accept: "*/*",
        };

        if (token?.trim()) {
          headers.Authorization = `Bearer ${token.trim()}`;
        }

        const response =
          method === "GET"
            ? await axios.get(url, {
              headers,
              params: finalPayload,
            })
            : await axios.post(url, finalPayload, {
              headers,
            });

        const responseData = response.data;
        const list = extractRows(responseData);
        const total = extractTotalRecords(responseData, list.length);

        setRaw(responseData);
        setRows(list);
        setTotalRecords(total);
      } catch (err: any) {
        setRows([]);
        setRaw(null);
        setTotalRecords(0);
        setError(
          err?.response?.data?.Message ||
          err?.response?.data?.message ||
          err?.message ||
          "API call failed"
        );
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (!autoFetch) return;
      fetchData();
    }, [url, method, token, JSON.stringify(finalPayload), autoFetch]);

    useEffect(() => {
      setPageIndex(initialPage || 1);
    }, [initialPage]);

    useEffect(() => {
      setCurrentPageSize(pageSize || 20);
    }, [pageSize]);

    const canPrev = pageIndex > 1;
    const canNext = pageIndex < totalPages;

    const handlePrev = () => {
      if (!canPrev || loading) return;
      setPageIndex((prev) => Math.max(1, prev - 1));
    };

    const handleNext = () => {
      if (!canNext || loading) return;
      setPageIndex((prev) => prev + 1);
    };

    const handlePageSizeChange = (value: number) => {
      const nextSize = Math.max(1, value || 20);
      setCurrentPageSize(nextSize);
      setPageIndex(1);
    };

    return (
      <div
        ref={(ref: any) => connect(drag(ref))}
        className={[
          "w-full min-h-[120px]",
          selected ? "ring-2 ring-indigo-500" : "",
        ].join(" ")}
        style={{
          background,
          color: textColor,
          border: `1px solid ${borderColor}`,
          borderRadius: `${radius}px`,
          padding: `${padding}px`,
          boxSizing: "border-box",
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-xs opacity-70">
              {method} • trang {pageIndex}/{totalPages} • {totalRecords} bản ghi
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {showReloadButton && (
              <button
                type="button"
                onClick={fetchData}
                className="px-3 py-2 text-sm rounded border"
                style={{
                  borderColor,
                  color: textColor,
                  background: "transparent",
                }}
              >
                {loading ? "Loading..." : "Reload"}
              </button>
            )}

            {/* Export dropdown */}
            {rows.length > 0 && (
              <ExportMenu
                rows={rows}
                cols={displayColumns}
                title={title || "export"}
                borderColor={borderColor}
                textColor={textColor}
              />
            )}
          </div>
        </div>

        {parsedSearchFields.length > 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 12px",
              border: `1px solid ${borderColor}`,
              borderRadius: 10,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 10,
                marginBottom: 10,
              }}
            >
              {parsedSearchFields.map((field) => (
                <div key={field}>
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.65,
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    {field}
                  </div>
                  <input
                    type="text"
                    placeholder={`Tìm theo ${field}...`}
                    value={searchFieldValues[field] ?? ""}
                    onChange={(e) =>
                      setSearchFieldValues((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setCommittedSearchValues({ ...searchFieldValues });
                        setPageIndex(1);
                        setTimeout(() => fetchData(), 0);
                      }
                    }}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${borderColor}`,
                      background: "transparent",
                      color: textColor,
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setCommittedSearchValues({ ...searchFieldValues });
                  setPageIndex(1);
                  setTimeout(() => fetchData(), 0);
                }}
                style={{
                  padding: "7px 20px",
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  background: textColor,
                  color: background,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Đang tìm..." : "Tìm kiếm"}
              </button>
            </div>
          </div>
        )}

        {showPagination && (
          <div
            className="flex items-center justify-between gap-3 flex-wrap mb-4"
            style={{
              padding: "10px 12px",
              border: `1px solid ${borderColor}`,
              borderRadius: 10,
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canPrev || loading}
                className="px-3 py-2 text-sm rounded border disabled:opacity-50"
                style={{
                  borderColor,
                  color: textColor,
                  background: "transparent",
                }}
              >
                Trước
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext || loading}
                className="px-3 py-2 text-sm rounded border disabled:opacity-50"
                style={{
                  borderColor,
                  color: textColor,
                  background: "transparent",
                }}
              >
                Sau
              </button>

              <div className="text-sm opacity-80">
                Trang
              </div>

              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageIndex}
                onChange={(e) => {
                  const v = Number(e.target.value) || 1;
                  setPageIndex(Math.min(Math.max(1, v), totalPages));
                }}
                className="w-20 px-2 py-2 rounded border text-sm"
                style={{
                  borderColor,
                  color: textColor,
                  background: "transparent",
                }}
              />

              <div className="text-sm opacity-80">/ {totalPages}</div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm opacity-80">Kích thước trang</span>
              <select
                value={currentPageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-2 rounded border text-sm"
                style={{
                  borderColor,
                  color: textColor,
                  background: background,
                }}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {error ? (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: "#fee2e2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        ) : loading ? (
          <div className="text-sm opacity-70">Loading data...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm opacity-70">No data</div>
        ) : viewMode === "card" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {rows.map((row, index) => (
              <div
                key={index}
                style={{
                  border: `1px solid ${borderColor}`,
                  borderRadius: 10,
                  padding: 14,
                  background: "#ffffff",
                  color: "#111827",
                }}
              >
                {displayColumns.map((col) => (
                  <div
                    key={col}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "110px 1fr",
                      gap: 8,
                      padding: "6px 0",
                      borderBottom: "1px dashed #e5e7eb",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{col}</div>
                    <div style={{ wordBreak: "break-word" }}>
                      {formatValue(row[col])}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              border: `1px solid ${borderColor}`,
              borderRadius: 10,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {displayColumns.map((col) => (
                    <th
                      key={col}
                      style={{
                        textAlign: "left",
                        padding: 12,
                        borderBottom: "1px solid #e5e7eb",
                        color: "#111827",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {displayColumns.map((col) => (
                      <td
                        key={col}
                        style={{
                          padding: 12,
                          borderBottom: "1px solid #f3f4f6",
                          color: "#111827",
                          verticalAlign: "top",
                        }}
                      >
                        {formatValue(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* <details className="mt-4">
        <summary className="cursor-pointer text-sm opacity-80">
          View raw response
        </summary>
        <pre
          style={{
            marginTop: 10,
            background: "#0f172a",
            color: "#e2e8f0",
            padding: 12,
            borderRadius: 10,
            fontSize: 12,
            overflow: "auto",
          }}
        >
          {JSON.stringify(raw, null, 2)}
        </pre>
      </details> */}
      </div>
    );
  };

const DynamicApiListSettings = () => {
  const {
    url,
    method,
    token,
    payload,
    title,
    viewMode,
    columns,
    background,
    textColor,
    borderColor,
    radius,
    padding,
    pageSize,
    initialPage,
    showPagination,
    showReloadButton,
    autoFetch,
    searchFields,
    actions: { setProp },
  } = useNode((node) => ({
    url: node.data.props.url,
    method: node.data.props.method,
    token: node.data.props.token,
    payload: node.data.props.payload,
    title: node.data.props.title,
    viewMode: node.data.props.viewMode,
    columns: node.data.props.columns,
    background: node.data.props.background,
    textColor: node.data.props.textColor,
    borderColor: node.data.props.borderColor,
    radius: node.data.props.radius,
    padding: node.data.props.padding,
    pageSize: node.data.props.pageSize,
    initialPage: node.data.props.initialPage,
    showPagination: node.data.props.showPagination,
    showReloadButton: node.data.props.showReloadButton,
    autoFetch: node.data.props.autoFetch,
    searchFields: node.data.props.searchFields,
  }));

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-zinc-400 block mb-1">Title</label>
        <input
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
          value={title || ""}
          onChange={(e) => setProp((p: any) => (p.title = e.target.value))}
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">URL</label>
        <input
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
          value={url || ""}
          onChange={(e) => setProp((p: any) => (p.url = e.target.value))}
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">Method</label>
        <select
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
          value={method || "POST"}
          onChange={(e) => setProp((p: any) => (p.method = e.target.value))}
        >
          <option value="POST">POST</option>
          <option value="GET">GET</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">Token</label>
        <textarea
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded min-h-[80px]"
          value={token || ""}
          onChange={(e) => setProp((p: any) => (p.token = e.target.value))}
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">Payload JSON</label>
        <textarea
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded min-h-[180px]"
          value={payload || ""}
          onChange={(e) => setProp((p: any) => (p.payload = e.target.value))}
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">
          Columns (comma separated)
        </label>
        <input
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
          value={columns || ""}
          placeholder="HO_TEN,SO_DINH_DANH,EMAIL"
          onChange={(e) => setProp((p: any) => (p.columns = e.target.value))}
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">
          Search Fields (comma separated)
        </label>
        <input
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
          value={searchFields || ""}
          placeholder="SO_HO_CHIEU,SO_DINH_DANH,EMAIL"
          onChange={(e) =>
            setProp((p: any) => (p.searchFields = e.target.value))
          }
        />
        <div className="text-xs text-zinc-500 mt-1">
          Mỗi field sẽ tạo ra 1 ô tìm kiếm, giá trị được truyền vào SEARCH_FIELD
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">View Mode</label>
        <select
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
          value={viewMode || "card"}
          onChange={(e) => setProp((p: any) => (p.viewMode = e.target.value))}
        >
          <option value="card">Card</option>
          <option value="table">Table</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-zinc-400 block mb-1">Initial Page</label>
          <input
            type="number"
            className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
            value={initialPage ?? 1}
            onChange={(e) =>
              setProp((p: any) => (p.initialPage = Number(e.target.value) || 1))
            }
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">Page Size</label>
          <input
            type="number"
            className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
            value={pageSize ?? 20}
            onChange={(e) =>
              setProp((p: any) => (p.pageSize = Number(e.target.value) || 20))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={!!showPagination}
            onChange={(e) =>
              setProp((p: any) => (p.showPagination = e.target.checked))
            }
          />
          Show pagination
        </label>

        <label className="flex items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={!!showReloadButton}
            onChange={(e) =>
              setProp((p: any) => (p.showReloadButton = e.target.checked))
            }
          />
          Show reload button
        </label>

        <label className="flex items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={!!autoFetch}
            onChange={(e) =>
              setProp((p: any) => (p.autoFetch = e.target.checked))
            }
          />
          Auto fetch
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-zinc-400 block mb-1">Background</label>
          <input
            type="color"
            className="w-full h-9 rounded"
            value={background || "#ffffff"}
            onChange={(e) => setProp((p: any) => (p.background = e.target.value))}
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">Text</label>
          <input
            type="color"
            className="w-full h-9 rounded"
            value={textColor || "#111827"}
            onChange={(e) => setProp((p: any) => (p.textColor = e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-zinc-400 block mb-1">Border</label>
          <input
            type="color"
            className="w-full h-9 rounded"
            value={borderColor || "#e5e7eb"}
            onChange={(e) => setProp((p: any) => (p.borderColor = e.target.value))}
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">Radius</label>
          <input
            type="number"
            className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
            value={radius ?? 12}
            onChange={(e) =>
              setProp((p: any) => (p.radius = Number(e.target.value) || 12))
            }
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">Padding</label>
        <input
          type="number"
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
          value={padding ?? 16}
          onChange={(e) =>
            setProp((p: any) => (p.padding = Number(e.target.value) || 16))
          }
        />
      </div>
    </div>
  );
};

DynamicApiListComponent.craft = {
  displayName: "Dynamic API List",
  props: {
    url: "",
    method: "POST",
    token: "",
    payload: `{
  "PRC_CODE": "PRC_NIFS_THONGTIN_DOI_TUONG",
  "SEARCH": "",
  "SEARCH_FIELD": {},
  "PAGE_INDEX": "1",
  "PAGE_SIZE": "20"
}`,
    title: "Dynamic API List",
    viewMode: "card",
    columns: "",
    background: "#ffffff",
    textColor: "#111827",
    borderColor: "#e5e7eb",
    radius: 12,
    padding: 16,
    pageSize: 20,
    initialPage: 1,
    showPagination: true,
    showReloadButton: true,
    autoFetch: true,
    searchFields: "",
  },
  related: {
    settings: DynamicApiListSettings,
  },
};