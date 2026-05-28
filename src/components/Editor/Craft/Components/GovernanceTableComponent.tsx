/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNode, useEditor } from "@craftjs/core";
import axios from "axios";

// Helper for safe JSON
const safeJson = (str: string) => {
  try {
    return JSON.parse(str || "{}");
  } catch (e) {
    return {};
  }
};

// ─────────────────────────────────────────────
// Icons & UI Snippets
// ─────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const ColumnsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);

const ToggleSwitch: React.FC<{ active: boolean; onChange?: (val: boolean) => void }> = ({ active, onChange }) => (
  <div 
    onClick={() => onChange?.(!active)}
    style={{
      width: 44,
      height: 22,
      borderRadius: 22,
      background: active ? "#10b981" : "#9ca3af",
      position: "relative",
      cursor: "pointer",
      transition: "background 0.2s"
    }}
  >
    <div 
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#fff",
        position: "absolute",
        top: 2,
        left: active ? 24 : 2,
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
      }}
    />
  </div>
);

// ─── Export Helpers ──────────────────────────
function formatValue(value: any) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob(["\uFEFF" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV(rows: any[], cols: string[], filename = "export") {
  const escape = (v: any) => {
    const s = formatValue(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.join(",");
  const body = rows.map((r) => cols.map((c) => escape(r[c])).join(",")).join("\n");
  downloadBlob(header + "\n" + body, `${filename}.csv`, "text/csv;charset=utf-8");
}


// ─────────────────────────────────────────────
// Component Props
// ─────────────────────────────────────────────
interface GovernanceTableProps {
  defaultApiUrl?: string;
  defaultToken?: string;
  targetNodeCode?: string;
  urlMapping?: string;
  hideIfNoMatch?: boolean;
  columnsConfig?: string;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export const GovernanceTableComponent: React.FC<GovernanceTableProps> & { craft?: any } = ({
  defaultApiUrl = "https://dev-api.cdsdservice.com/microservice-governance/api/SYS_DST_TYPE/getlist",
  defaultToken = "",
  targetNodeCode = "sysDataSourceType", // The node that triggers this table
  urlMapping = "{}", // Mapping for other categories
  hideIfNoMatch = true,
  columnsConfig = "",
}) => {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({ selected: node.events.selected }));
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeNode, setActiveNode] = useState<any>(null); // Details from the tree
  const [currentApiUrl, setCurrentApiUrl] = useState(defaultApiUrl);
  const [showThaoTacMenu, setShowThaoTacMenu] = useState(false);
  
  // Search state
  const [searchCode, setSearchCode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchActive, setSearchActive] = useState(true);
  const [searchDeleted, setSearchDeleted] = useState(false);

  // Table selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Listen to Global tree selection event
  useEffect(() => {
    const handleNodeSelect = (e: any) => {
      const node = e.detail;
      const mapping = safeJson(urlMapping);
      
      // Determine new URL
      let nextUrl = defaultApiUrl;
      const isTarget = node?.CODE === targetNodeCode || node?.CODE?.includes("sysDataSourceType");
      
      if (node?.API_URL) {
        nextUrl = node.API_URL;
      } else if (mapping[node?.CODE]) {
        nextUrl = mapping[node?.CODE];
      } else if (!isTarget) {
        // If not explicit target and no mapping, don't update data or update to generic if desired
        // For now, let's assume if it's NOT a target node and no mapping, we clear the table
        setActiveNode(null);
        setData([]);
        return;
      }

      setActiveNode(node);
      setCurrentApiUrl(nextUrl);
      setPage(1);
      fetchData(nextUrl, 1);
    };
    window.addEventListener("ON_CRAFT_TREE_NODE_SELECT", handleNodeSelect);
    return () => window.removeEventListener("ON_CRAFT_TREE_NODE_SELECT", handleNodeSelect);
  }, [targetNodeCode, defaultApiUrl, defaultToken, urlMapping]);

  // If auto-fetch for the targetNode by default when dropping the component
  useEffect(() => {
    if (!activeNode) fetchData(currentApiUrl, 1); // Fetch initially if wanted
  }, []);

  const fetchData = async (apiUrl = currentApiUrl, pageIdx = page) => {
    setLoading(true);
    try {
      const payload = {
        SearchField: {
          IS_DELETE: searchDeleted ? 1 : 0,
          IS_ACTIVE: searchActive ? 1 : 0,
          CODE: searchCode || undefined,
          NAME: searchName || undefined,
          ...(activeNode?.CODE ? { CATEGORY_CODE: activeNode.CODE } : {}),
        },
        CDATE_START: "2020-01-01",
        CDATE_END: "2030-12-31",
        PageIndex: pageIdx,
        PageSize: pageSize,
      };

      const headers: any = {
        "Content-Type": "application/json",
        "Origin": "https://dev-gvn.cdsdservice.com",
      };
      if (defaultToken) headers["Authorization"] = `Bearer ${defaultToken}`;

      const res = await axios.post(apiUrl, payload, { headers });
      const items = res.data?.Data || res.data?.data || res.data || [];
      const totalRecs = res.data?.TotalRecords || items.length;
      
      setData(Array.isArray(items) ? items : []);
      setTotal(totalRecs);
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Fetch Data Error:", error);
      // Fallback dummy data if API fails to display the UI properly for design verification
      setData([
         { ID: 1, CODE: "UPLOAD", NAME: "Dữ liệu được tải lên thủ công", NOTE: "", IS_ACTIVE: 1 },
         { ID: 2, CODE: "PCT", NAME: "Dữ liệu phi cấu trúc", NOTE: "", IS_ACTIVE: 1 },
         { ID: 3, CODE: "VB01", NAME: "Dữ liệu văn bản", NOTE: "", IS_ACTIVE: 1 },
         { ID: 4, CODE: "KGM", NAME: "Lưu trữ dữ liệu được thu thập từ không gian mạng", NOTE: "", IS_ACTIVE: 1 },
      ]);
      setTotal(18);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchData(currentApiUrl, 1);
  };

  const handleClearSearch = () => {
    setSearchCode("");
    setSearchName("");
    setSearchActive(true);
    setSearchDeleted(false);
  };

  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map(d => d.ID || d.CODE)));
  };

  const toggleSelectRow = (id: any) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Determine visibility
  const isMatch = activeNode?.CODE === targetNodeCode || (activeNode?.CODE && activeNode.CODE.includes(targetNodeCode));
  
  if (hideIfNoMatch && !isMatch) {
    if (!enabled) return null; // Hide completely in view mode
    return (
      <div 
        ref={(ref: any) => connect(drag(ref))}
        style={{
          padding: "20px",
          border: "2px dashed #e5e7eb",
          borderRadius: "8px",
          background: "#f9fafb",
          color: "#9ca3af",
          textAlign: "center",
          fontSize: "13px",
          outline: selected ? "2px solid #6366f1" : "none",
        }}
      >
        Bảng dữ liệu ẩn (Mục tiêu: <b>{targetNodeCode}</b>)
      </div>
    );
  }

  const parsedCols = safeJson(columnsConfig);
  const displayCols = Array.isArray(parsedCols) && parsedCols.length > 0 ? parsedCols : [
    { key: "CODE", label: "Mã loại đích" },
    { key: "NAME", label: "Tên loại đích" },
    { key: "NOTE", label: "Ghi chú" },
    { key: "IS_ACTIVE", label: "Hoạt động", type: "toggle" }
  ];

  return (
    <div 
      ref={(ref: any) => connect(drag(ref))}
      style={{
        background: "#fff",
        minHeight: "400px",
        outline: selected ? "2px solid #6366f1" : "none",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: "24px"
      }}
    >
      {/* ─── Header Ttitle ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: "600", margin: 0, color: "#1f2937" }}>
          {activeNode ? activeNode.NAME : "Danh mục loại dữ liệu"}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#10b981", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
            <PlusIcon /> Thêm
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#f3f4f6", color: "#9ca3af", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: "not-allowed", fontWeight: 500 }}>
            <TrashIcon /> Xóa đã chọn
          </button>
          
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => setShowThaoTacMenu(!showThaoTacMenu)}
              style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 500 }}
            >
              Thao tác
            </button>
            {showThaoTacMenu && (
              <div style={{ position: "absolute", top: "110%", right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 150, overflow: "hidden" }}>
                <button 
                  onClick={() => { exportCSV(data, ["CODE", "NAME", "NOTE", "IS_ACTIVE"], activeNode?.NAME || "Export"); setShowThaoTacMenu(false); }}
                  style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  Export CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Search Controls ─── */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#1f2937", marginBottom: 6 }}>Mã loại đích</label>
          <input 
            type="text" 
            placeholder="Nhập Mã loại đích" 
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#1f2937", marginBottom: 6 }}>Tên loại đích</label>
          <input 
            type="text" 
            placeholder="Nhập Tên loại đích" 
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#1f2937", marginBottom: 6 }}>Hoạt động</label>
          <ToggleSwitch active={searchActive} onChange={setSearchActive} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#1f2937", marginBottom: 6 }}>Đã xóa</label>
          <ToggleSwitch active={searchDeleted} onChange={setSearchDeleted} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button 
          onClick={handleSearch}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#3b82f6", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
          <SearchIcon /> Tìm kiếm
        </button>
        <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#1f2937", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
          <FilterIcon /> Lọc nâng cao
        </button>
        <button 
          onClick={handleClearSearch}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#ef4444", border: "1px solid #e5e7eb", padding: "8px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
          <RefreshIcon /> Xóa tìm kiếm
        </button>
      </div>

      {/* ─── List Controls ─── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
         <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#1f2937", border: "1px solid #e5e7eb", padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
           <ColumnsIcon /> Hiển thị cột
         </button>
      </div>

      {/* ─── Table ─── */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", position: "relative" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
             Loading...
          </div>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#2296c4", color: "#fff" }}>
              <th style={{ padding: "12px", width: 40, textAlign: "center" }}>
                 <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{ width: 16, height: 16 }} />
              </th>
              {displayCols.map((c: any) => (
                <th key={c.key} style={{ padding: "12px", fontWeight: 600, textAlign: c.type === "toggle" ? "center" : "left" }}>
                  {c.label}
                </th>
              ))}
              <th style={{ padding: "12px", fontWeight: 600, width: 100, textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const id = row.ID || row.CODE;
              const isSelected = selectedIds.has(id);
              return (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb", background: isSelected ? "#f0f9ff" : "#fff" }}>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelectRow(id)} style={{ width: 16, height: 16 }} />
                  </td>
                  {displayCols.map((c: any) => (
                    <td key={c.key} style={{ padding: "12px", color: "#1f2937", textAlign: c.type === "toggle" ? "center" : "left" }}>
                      {c.type === "toggle" ? (
                        <div style={{ display: "inline-block" }}>
                          <ToggleSwitch active={row[c.key] === 1 || row[c.key] === true} />
                        </div>
                      ) : (
                        formatValue(row[c.key])
                      )}
                    </td>
                  ))}
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <button style={{ width: 30, height: 30, borderRadius: 6, background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <EditIcon />
                      </button>
                      <button style={{ width: 30, height: 30, borderRadius: 6, background: "#f87171", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Pagination ─── */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 16, fontSize: 13, color: "#1f2937", gap: 16 }}>
         <div>Tổng <b>{total}</b> bản ghi</div>
         <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button 
              disabled={page <= 1}
              onClick={() => { setPage(p => p - 1); fetchData(currentApiUrl, page - 1); }}
              style={{ color: page <= 1 ? "#9ca3af" : "#1f2937", cursor: page <= 1 ? "not-allowed" : "pointer", padding: "4px 8px", background: "none", border: "none" }}
            >
              &lt;
            </button>
            <span style={{ background: "#eff6ff", color: "#3b82f6", padding: "4px 12px", borderRadius: 4, fontWeight: 500 }}>{page}</span>
            <button 
              disabled={data.length < pageSize}
              onClick={() => { setPage(p => p + 1); fetchData(currentApiUrl, page + 1); }}
              style={{ color: data.length < pageSize ? "#9ca3af" : "#1f2937", cursor: data.length < pageSize ? "not-allowed" : "pointer", padding: "4px 12px", background: "none", border: "none" }}
            >
              &gt;
            </button>
         </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Craft settings
// ─────────────────────────────────────────────
const Settings = () => {
  const { defaultApiUrl, defaultToken, targetNodeCode, urlMapping, hideIfNoMatch, columnsConfig, actions: { setProp } } = useNode((node) => ({
    defaultApiUrl: node.data.props.defaultApiUrl,
    defaultToken: node.data.props.defaultToken,
    targetNodeCode: node.data.props.targetNodeCode,
    urlMapping: node.data.props.urlMapping,
    hideIfNoMatch: node.data.props.hideIfNoMatch,
    columnsConfig: node.data.props.columnsConfig,
  }));

  return (
    <div className="space-y-3 text-white text-xs">
      <div>
        <label className="block text-zinc-400 mb-1">Target Node Code</label>
        <input 
           className="w-full bg-zinc-800 p-2 rounded" 
           value={targetNodeCode || ""} 
           onChange={e => setProp((p: any) => p.targetNodeCode = e.target.value)} 
        />
        <div className="opacity-50 mt-1">Mã danh mục để bảng này hiển thị. Bảng sẽ ẩn nếu mục khác được chọn.</div>
      </div>

      <div className="flex items-center gap-2 py-2">
        <input 
          type="checkbox" 
          checked={hideIfNoMatch} 
          onChange={e => setProp((p: any) => p.hideIfNoMatch = e.target.checked)} 
        />
        <label className="text-zinc-400">Ẩn nếu không khớp mã</label>
      </div>

      <div>
        <label className="block text-zinc-400 mb-1">Cấu hình Cột (JSON)</label>
        <textarea 
           className="w-full bg-zinc-800 p-2 rounded" 
           rows={5}
           placeholder='[{"key": "CODE", "label": "Mã"}, ...]'
           value={columnsConfig || ""} 
           onChange={e => setProp((p: any) => p.columnsConfig = e.target.value)} 
        />
        <div className="opacity-50 mt-1">{'VD: [{"key": "ID", "label": "ID"}, {"key": "NAME", "label": "Tên"}]'}</div>
      </div>
      <div>
        <label className="block text-zinc-400 mb-1">URL Mapping (JSON)</label>
        <textarea 
           className="w-full bg-zinc-800 p-2 rounded" 
           rows={5}
           placeholder='{"node_code": "https://api.url/..."}'
           value={urlMapping || ""} 
           onChange={e => setProp((p: any) => p.urlMapping = e.target.value)} 
        />
        <div className="opacity-50 mt-1">Map mã danh mục trên cây sang URL API cụ thể.</div>
      </div>
      <div>
        <label className="block text-zinc-400 mb-1">API URL (Fallback/Default)</label>
        <input 
           className="w-full bg-zinc-800 p-2 rounded" 
           value={defaultApiUrl || ""} 
           onChange={e => setProp((p: any) => p.defaultApiUrl = e.target.value)} 
        />
      </div>
      <div>
        <label className="block text-zinc-400 mb-1">Bearer Token</label>
        <textarea 
           className="w-full bg-zinc-800 p-2 rounded" 
           rows={4}
           value={defaultToken || ""} 
           onChange={e => setProp((p: any) => p.defaultToken = e.target.value)} 
        />
      </div>
    </div>
  );
};

(GovernanceTableComponent as any).craft = {
  displayName: "Governance Table",
  props: {
    defaultApiUrl: "https://dev-api.cdsdservice.com/microservice-governance/api/SYS_DST_TYPE/getlist",
    defaultToken: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJFMjIyLWdIa0VHLTMwc2FrQ2FIM01WZjZqd3hwMG5XVlpwSDZtVS1KYU93In0.eyJleHAiOjE3NzYxNTU1MTQsImlhdCI6MTc3NjE1NDYxNCwiYXV0aF90aW1lIjoxNzc2MTM0MzAyLCJqdGkiOiIwNWYwNDQ1MC0yYzcyLTRmMDQtYjkyYi04ZmJmYjA4NTE3YTEiLCJpc3MiOiJodHRwczovL2Rldi1pZC5jZHNkc2VydmljZS5jb20vYXV0aC9yZWFsbXMvSU5URVJOQUwiLCJhdWQiOiJvcGVuLW1ldGFkYXRhLW5ldyIsInN1YiI6ImRjNWNiZGFlLWI0Y2QtNDNjZS05OWEzLTMwMjdhMzA2M2E1YiIsInR5cCI6IklEIiwiYXpwIjoib3Blbi1tZXRhZGF0YS1uZXciLCJub25jZSI6Ijc5YzExZWM2ZWY5YTRiZDliMzUzZGI0MTllMThhNTE1Iiwic2Vzc2lvbl9zdGF0ZSI6ImUyZTQyNTMzLTQzNzctNDBjMC1hOGViLTYxN2I0YWQ4ODdiNyIsImFjciI6IjAiLCJzX2hhc2giOiJISC1LLUJ4dDh0eDJJRTZWZ2dCN19RIiwic2lkIjoiZTJlNDI1MzMtNDM3Ny00MGMwLWE4ZWItNjE3YjRhZDg4N2I3IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzeXN0ZW0uYWRtaW4iLCJlbWFpbCI6InN5c3RlbS5hZG1pbkBlbWFpbC5jb20iLCJtYXBwZXJfcm9sZXMiOlsidmlld2VyIiwiZGV2Iiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1pbnRlcm5hbCJdfQ.Ue-fFOkJsKOVAqCLxBXPNeXZ4otSYxzg536-66rzJyUxOXv1Vz6VBiXDGGG9jzcg2nJM-GUPk-u8SN_eY7uZnW0x-r_E0lRsJSj7UCQZiWv37_FEm0K2JIBWDvTRXRkORKg2DFIYjfsh2HwnFa3nv8uTEBVu1-HTbVico9LBh9yc1w1QvjMC2l8mdndNTJ2kwZw4D7EYiRsB-6I7MqQcxJTcNWuR2Logejg9WBr6_5HCLgwbxmW8kqzFkSsbYuXQZteZEJx4TFM464abiDn0ht1I7KC1k3QlzZwqhnh-QLDEHU-p9A-AuIGsuheN8QSi-sQOWOXinfhqzcKKU8RE2Q",
    targetNodeCode: "sysDataSourceType",
    urlMapping: "{}",
    hideIfNoMatch: true,
    columnsConfig: "",
  },
  related: {
    settings: Settings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true,
  },
};
