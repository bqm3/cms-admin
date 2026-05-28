/* eslint-disable prettier/prettier */
import React, { useMemo, useState, useRef, Component } from "react";
import { useNode, useEditor } from "@craftjs/core";
import { Chart } from "react-google-charts";

// ─── Types ───────────────────────────────────────────
export type ChartType =
  | "BarChart" | "ColumnChart" | "LineChart"
  | "PieChart" | "AreaChart"  | "ScatterChart";

interface GoogleChartsProps {
  chartType?: ChartType;
  title?: string;
  width?: string;
  height?: string;
  backgroundColor?: string;
  colors?: string;
  legendPosition?: string;
  hAxisTitle?: string;
  vAxisTitle?: string;
  pieHole?: number;
  dataJson?: string;
  optionsJson?: string;
}

// ─── Default data ────────────────────────────────────
const DEFAULT_DATA: Record<ChartType, any[][]> = {
  BarChart: [
    ["Khu vực", "2023", "2024"],
    ["Hà Nội", 1200, 1500],
    ["TP.HCM", 2200, 2600],
    ["Đà Nẵng", 800, 950],
    ["Cần Thơ", 600, 720],
  ],
  ColumnChart: [
    ["Tháng", "Doanh thu", "Mục tiêu"],
    ["T1", 420, 500], ["T2", 530, 500],
    ["T3", 490, 500], ["T4", 610, 600],
    ["T5", 580, 600], ["T6", 720, 700],
  ],
  LineChart: [
    ["Ngày", "Người dùng", "Phiên"],
    ["01/04", 800, 1200], ["08/04", 950, 1400],
    ["15/04", 1100, 1600], ["22/04", 1050, 1500],
  ],
  PieChart: [
    ["Nguồn", "Tỷ lệ"],
    ["Tải lên", 35], ["API", 28],
    ["Web", 20], ["DB", 12], ["Khác", 5],
  ],
  AreaChart: [
    ["Quý", "Xử lý (GB)", "Lưu trữ (GB)"],
    ["Q1/23", 120, 200], ["Q2/23", 180, 280],
    ["Q3/23", 240, 360], ["Q4/23", 300, 450],
  ],
  ScatterChart: [
    ["Kích thước (MB)", "Thời gian (s)"],
    [10, 2.1], [25, 4.5], [50, 8.2],
    [100, 15.6], [200, 28.4], [500, 62.1],
  ],
};

const DEFAULT_COLORS: Record<ChartType, string[]> = {
  BarChart:     ["#4f86f7", "#34d399"],
  ColumnChart:  ["#6366f1", "#f59e0b"],
  LineChart:    ["#10b981", "#f87171"],
  PieChart:     ["#6366f1", "#22d3ee", "#f59e0b", "#f87171", "#a3e635"],
  AreaChart:    ["#6366f1", "#10b981"],
  ScatterChart: ["#f59e0b"],
};

const CHART_LABELS: Record<ChartType, { icon: string; label: string }> = {
  BarChart:     { icon: "📊", label: "Bar Chart" },
  ColumnChart:  { icon: "📈", label: "Column Chart" },
  LineChart:    { icon: "📉", label: "Line Chart" },
  PieChart:     { icon: "🥧", label: "Pie Chart" },
  AreaChart:    { icon: "🌊", label: "Area Chart" },
  ScatterChart: { icon: "🔵", label: "Scatter Chart" },
};

const CHART_TYPES: ChartType[] = [
  "BarChart", "ColumnChart", "LineChart",
  "PieChart", "AreaChart",  "ScatterChart",
];

// ─── Helpers ─────────────────────────────────────────
function toStr(val: any): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  return "";
}

// Try to fix common JSON issues before parsing
function tryFixJson(s: string): string {
  return s
    // Remove trailing commas before ] or }
    .replace(/,\s*([\]\}])/g, "$1");
}

// Returns { data, error } — error is null on success
function parseDataJson(raw: any): any[][] | null {
  if (Array.isArray(raw)) return raw.length >= 2 ? raw : null;
  const s = toStr(raw).trim();
  if (!s) return null;
  // Try original first, then with fixes applied
  for (const attempt of [s, tryFixJson(s)]) {
    try {
      const p = JSON.parse(attempt);
      if (Array.isArray(p) && p.length >= 2) return p;
    } catch { /* try next */ }
  }
  return null;
}

// Returns detailed error string for UI display
function getDataJsonError(raw: string): string | null {
  if (!raw.trim()) return null;
  for (const attempt of [raw.trim(), tryFixJson(raw.trim())]) {
    try {
      const p = JSON.parse(attempt);
      if (!Array.isArray(p)) return "Phải là mảng JSON: [[\"Header\",\"Series\"],[val,val],...]";
      if (p.length < 2) return "Cần ít nhất 2 hàng (1 header + 1 dữ liệu).";
      return null; // valid
    } catch (e: any) {
      // Don't return yet — try next attempt
    }
  }
  // Both failed — return the original parse error
  try { JSON.parse(raw.trim()); return null; }
  catch (e: any) { return `JSON lỗi cú pháp: ${e.message}`; }
}

function parseOptionsJson(raw: any): Record<string, any> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  const s = toStr(raw).trim();
  if (!s) return {};
  try {
    const p = JSON.parse(s);
    return p && typeof p === "object" && !Array.isArray(p) ? p : {};
  } catch { return {}; }
}

function parseColors(raw: any, fallback: string[]): string[] {
  const s = toStr(raw).trim();
  if (!s) return fallback;
  const parts = s.split(",").map((c) => c.trim()).filter(Boolean);
  return parts.length ? parts : fallback;
}

// ─── Error Boundary ──────────────────────────────────
interface EBState { hasError: boolean; msg: string }
class ChartErrorBoundary extends Component<
  { children: React.ReactNode; height: string },
  EBState
> {
  state: EBState = { hasError: false, msg: "" };
  static getDerivedStateFromError(e: any): EBState {
    return { hasError: true, msg: e?.message ?? String(e) };
  }
  componentDidCatch(e: any) { console.warn("[GoogleChart]", e); }
  render() {
    const { hasError, msg } = this.state;
    const { height, children } = this.props;
    if (!hasError) return children;
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height, background: "#fef2f2",
        color: "#dc2626", padding: 24, gap: 8, textAlign: "center",
      }}>
        <span style={{ fontSize: 28 }}>⚠️</span>
        <strong style={{ fontSize: 13 }}>Chart render lỗi</strong>
        <span style={{ fontSize: 11, color: "#6b7280", maxWidth: 360 }}>{msg}</span>
        <button
          style={{
            marginTop: 8, padding: "4px 16px", borderRadius: 6,
            background: "#6366f1", color: "#fff", border: "none",
            cursor: "pointer", fontSize: 12,
          }}
          onClick={() => this.setState({ hasError: false, msg: "" })}
        >Thử lại</button>
      </div>
    );
  }
}

// ─── Main Component ───────────────────────────────────
// ⚠️ KEY PATTERN: Read ALL props from useNode selector (not from function args)
// This is the correct Craft.js pattern — ensures re-render when setProp is called
export const GoogleChartsComponent: React.FC<GoogleChartsProps> & { craft?: any } = () => {
  const {
    connectors: { connect, drag },
    selected,
    id: nodeId,
    // Read ALL editable props directly from Craft.js node state
    chartType,
    title,
    width,
    height,
    backgroundColor,
    colors,
    legendPosition,
    hAxisTitle,
    vAxisTitle,
    pieHole,
    dataJson,
    optionsJson,
  } = useNode((n) => ({
    selected:        n.events.selected,
    id:              n.id,
    chartType:       (n.data.props.chartType as ChartType) ?? "ColumnChart",
    title:           n.data.props.title        ?? "",
    width:           n.data.props.width        ?? "100%",
    height:          n.data.props.height       ?? "360px",
    backgroundColor: n.data.props.backgroundColor ?? "#ffffff",
    colors:          n.data.props.colors       ?? "",
    legendPosition:  n.data.props.legendPosition ?? "top",
    hAxisTitle:      n.data.props.hAxisTitle   ?? "",
    vAxisTitle:      n.data.props.vAxisTitle   ?? "",
    pieHole:         n.data.props.pieHole      ?? 0.4,
    dataJson:        n.data.props.dataJson     ?? "",
    optionsJson:     n.data.props.optionsJson  ?? "",
  }));

  const { enabled } = useEditor((s) => ({ enabled: s.options.enabled }));

  // ── Resolve chart data from node's dataJson ──────────
  const chartData = useMemo<any[][]>(() => {
    const custom = parseDataJson(dataJson);
    const fallback = DEFAULT_DATA[chartType as ChartType] ?? DEFAULT_DATA.ColumnChart;
    return custom ?? fallback;
  }, [dataJson, chartType]);

  // ── Unique key per node + data content → forces Chart remount on data change
  const chartKey = useMemo(() => {
    try { return `${nodeId}::${chartType}::${JSON.stringify(chartData)}`; }
    catch { return `${nodeId}::${chartType}::${chartData.length}`; }
  }, [nodeId, chartType, chartData]);

  // ── Build options ─────────────────────────────────────
  const chartOptions = useMemo<Record<string, any>>(() => {
    const resolvedColors = parseColors(colors, DEFAULT_COLORS[chartType as ChartType] ?? ["#6366f1"]);

    const base: Record<string, any> = {
      backgroundColor: toStr(backgroundColor) || "#ffffff",
      colors: resolvedColors,
      legend: { position: toStr(legendPosition) || "top" },
      // ⚠️ No animation — causes 'Do' crash on re-renders in Craft.js editor
    };

    const t = toStr(title).trim();
    if (t) {
      base.title = t;
      base.titleTextStyle = { fontSize: 15, bold: true, color: "#1f2937" };
    }

    const hT = toStr(hAxisTitle).trim();
    const vT = toStr(vAxisTitle).trim();
    if (chartType !== "PieChart") {
      if (hT) base.hAxis = { title: hT };
      if (vT) base.vAxis = { title: vT };
    }

    if (chartType === "PieChart") {
      const ph = typeof pieHole === "number" ? pieHole : parseFloat(String(pieHole));
      base.pieHole = isNaN(ph) ? 0.4 : Math.min(Math.max(ph, 0), 0.9);
    }

    if (chartType === "LineChart") base.curveType = "function";
    if (chartType === "AreaChart") base.areaOpacity = 0.3;

    return { ...base, ...parseOptionsJson(optionsJson) };
  }, [chartType, backgroundColor, colors, legendPosition, hAxisTitle, vAxisTitle, pieHole, title, optionsJson]);

  const meta = CHART_LABELS[chartType as ChartType] ?? { icon: "📊", label: chartType };
  const h = toStr(height) || "360px";

  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      style={{
        background: toStr(backgroundColor) || "#ffffff",
        borderRadius: 12,
        overflow: "hidden",
        outline: selected ? "2px solid #6366f1" : "none",
        outlineOffset: 2,
        boxShadow: enabled && selected ? "0 0 0 4px rgba(99,102,241,0.15)" : "0 1px 4px rgba(0,0,0,0.07)",
        transition: "box-shadow 0.2s",
        position: "relative",
      }}
    >
      {enabled && (
        <div style={{
          position: "absolute", top: 8, right: 8, zIndex: 10,
          background: "rgba(99,102,241,0.9)", color: "#fff",
          fontSize: 10, fontWeight: 600, padding: "2px 10px",
          borderRadius: 20, pointerEvents: "none", userSelect: "none",
        }}>
          {meta.icon} {meta.label}
        </div>
      )}

      <ChartErrorBoundary height={h} key={chartKey}>
        <Chart
          key={chartKey}
          chartType={chartType as ChartType}
          data={chartData}
          options={chartOptions}
          width={toStr(width) || "100%"}
          height={h}
          loader={
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: h, gap: 8, color: "#9ca3af", fontSize: 13,
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: "50%",
                border: "2px solid #e5e7eb", borderTopColor: "#6366f1",
                display: "inline-block", animation: "gcspin 0.8s linear infinite",
              }} />
              Đang tải...
            </div>
          }
        />
      </ChartErrorBoundary>

      <style>{`@keyframes gcspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Settings Panel ───────────────────────────────────
const Settings = () => {
  const {
    chartType, title, width, height, backgroundColor,
    colors, legendPosition, hAxisTitle, vAxisTitle, pieHole,
    dataJson, optionsJson,
    actions: { setProp },
  } = useNode((n) => ({
    chartType:       n.data.props.chartType as ChartType,
    title:           n.data.props.title           ?? "",
    width:           n.data.props.width           ?? "100%",
    height:          n.data.props.height          ?? "360px",
    backgroundColor: n.data.props.backgroundColor ?? "#ffffff",
    colors:          n.data.props.colors          ?? "",
    legendPosition:  n.data.props.legendPosition  ?? "top",
    hAxisTitle:      n.data.props.hAxisTitle      ?? "",
    vAxisTitle:      n.data.props.vAxisTitle      ?? "",
    pieHole:         n.data.props.pieHole         ?? 0.4,
    dataJson:        n.data.props.dataJson        ?? "",
    optionsJson:     n.data.props.optionsJson     ?? "",
  }));

  const [tab, setTab] = useState<"data" | "style" | "adv">("data");

  // Local textarea state for Data JSON — keeps textarea responsive while typing
  // User clicks "Áp dụng" or blurs to commit to Craft.js
  const [localDataJson, setLocalDataJson] = useState(toStr(dataJson));
  const [localOptionsJson, setLocalOptionsJson] = useState(toStr(optionsJson));
  const [dataError, setDataError] = useState("");

  // Keep local state in sync when Craft.js resets (e.g. select different node)
  const prevNodeDataJson = useRef(toStr(dataJson));
  if (prevNodeDataJson.current !== toStr(dataJson)) {
    prevNodeDataJson.current = toStr(dataJson);
    // Only sync if different (avoid infinite loop)
    if (localDataJson !== toStr(dataJson)) {
      setLocalDataJson(toStr(dataJson));
    }
  }
  const prevNodeOptionsJson = useRef(toStr(optionsJson));
  if (prevNodeOptionsJson.current !== toStr(optionsJson)) {
    prevNodeOptionsJson.current = toStr(optionsJson);
    if (localOptionsJson !== toStr(optionsJson)) {
      setLocalOptionsJson(toStr(optionsJson));
    }
  }

  const applyDataJson = () => {
    const trimmed = localDataJson.trim();
    const err = trimmed ? getDataJsonError(trimmed) : null;
    if (err) {
      setDataError(err);
      return;
    }
    setDataError("");
    // Store the fixed version (trailing commas removed)
    const toStore = trimmed ? tryFixJson(trimmed) : "";
    setProp((p: any) => { p.dataJson = toStore; });
  };

  const applyOptionsJson = () => {
    const trimmed = localOptionsJson.trim();
    setProp((p: any) => { p.optionsJson = trimmed; });
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "#27272a", border: "1px solid #3f3f46",
    borderRadius: 6, padding: "6px 10px", color: "#fff", fontSize: 12, outline: "none",
  };
  const lbl: React.CSSProperties = {
    display: "block", color: "#a1a1aa", fontSize: 11, marginBottom: 4, fontWeight: 500,
  };
  const row: React.CSSProperties = { marginBottom: 14 };
  const applyBtn: React.CSSProperties = {
    marginTop: 6, padding: "5px 14px", background: "#6366f1", color: "#fff",
    border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11,
    fontWeight: 600, width: "100%",
  };

  return (
    <div style={{ color: "#fff", fontSize: 12 }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #3f3f46", marginBottom: 14 }}>
        {(["data", "style", "adv"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "6px 0", fontSize: 10, fontWeight: 700,
            background: "none", border: "none", cursor: "pointer",
            color: tab === t ? "#6366f1" : "#71717a",
            borderBottom: tab === t ? "2px solid #6366f1" : "2px solid transparent",
            textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            {t === "data" ? "📋 Data" : t === "style" ? "🎨 Style" : "⚙️ Advanced"}
          </button>
        ))}
      </div>

      {/* ── DATA ── */}
      {tab === "data" && (
        <>
          <div style={row}>
            <label style={lbl}>Loại biểu đồ</label>
            <select style={inp} value={chartType ?? "ColumnChart"}
              onChange={(e) => setProp((p: any) => { p.chartType = e.target.value; })}>
              {CHART_TYPES.map((t) => (
                <option key={t} value={t}>{CHART_LABELS[t].icon} {CHART_LABELS[t].label}</option>
              ))}
            </select>
          </div>

          <div style={row}>
            <label style={lbl}>
              Data JSON
              <span style={{ color: "#52525b", fontWeight: 400, marginLeft: 6 }}>
                — hàng đầu = headers
              </span>
            </label>
            <textarea
              style={{ ...inp, minHeight: 160, resize: "vertical", fontFamily: "monospace", fontSize: 11 }}
              value={localDataJson}
              spellCheck={false}
              placeholder={'[\n  ["Name", "Popularity"],\n  ["Cesar", 250],\n  ["Rachel", 4200],\n  ["Patrick", 2900]\n]'}
              onChange={(e) => {
                setLocalDataJson(e.target.value);
                setDataError("");
              }}
              onBlur={applyDataJson}
            />
            {dataError && (
              <div style={{ color: "#f87171", fontSize: 10, marginTop: 3 }}>⚠️ {dataError}</div>
            )}
            <button style={applyBtn} onClick={applyDataJson}>
              ✅ Áp dụng Data JSON
            </button>
            <div style={{ color: "#52525b", fontSize: 10, marginTop: 6, lineHeight: 1.5 }}>
              Nhấn <strong style={{ color: "#a1a1aa" }}>Áp dụng</strong> hoặc click ra ngoài để cập nhật biểu đồ.<br />
              Để trống → dùng data mẫu mặc định.
            </div>
          </div>
        </>
      )}

      {/* ── STYLE ── */}
      {tab === "style" && (
        <>
          <div style={row}>
            <label style={lbl}>Tiêu đề</label>
            <input style={inp} value={toStr(title)}
              placeholder="Tiêu đề biểu đồ..."
              onChange={(e) => setProp((p: any) => { p.title = e.target.value; })} />
          </div>

          <div style={{ ...row, display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={lbl}>Rộng</label>
              <input style={inp} value={toStr(width) || "100%"}
                onChange={(e) => setProp((p: any) => { p.width = e.target.value; })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={lbl}>Cao</label>
              <input style={inp} value={toStr(height) || "360px"}
                onChange={(e) => setProp((p: any) => { p.height = e.target.value; })} />
            </div>
          </div>

          <div style={row}>
            <label style={lbl}>Màu nền</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="color" value={toStr(backgroundColor) || "#ffffff"}
                onChange={(e) => setProp((p: any) => { p.backgroundColor = e.target.value; })}
                style={{ width: 34, height: 28, border: "none", cursor: "pointer", borderRadius: 4 }} />
              <input style={{ ...inp, flex: 1 }} value={toStr(backgroundColor) || "#ffffff"}
                onChange={(e) => setProp((p: any) => { p.backgroundColor = e.target.value; })} />
            </div>
          </div>

          <div style={row}>
            <label style={lbl}>
              Colors <span style={{ color: "#52525b", fontWeight: 400 }}>— cách nhau bằng dấu phẩy</span>
            </label>
            <input style={inp} value={toStr(colors)}
              placeholder="#6366f1, #f59e0b, #10b981"
              onChange={(e) => setProp((p: any) => { p.colors = e.target.value; })} />
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {toStr(colors).split(",").map((c) => c.trim()).filter((c) => /^#[0-9a-fA-F]{3,6}$/.test(c))
                .map((c, i) => (
                  <span key={i} title={c} style={{
                    width: 18, height: 18, borderRadius: 4, background: c,
                    border: "1px solid rgba(255,255,255,0.1)", display: "inline-block",
                  }} />
                ))}
            </div>
          </div>

          <div style={row}>
            <label style={lbl}>Legend</label>
            <select style={inp} value={toStr(legendPosition) || "top"}
              onChange={(e) => setProp((p: any) => { p.legendPosition = e.target.value; })}>
              {["top", "bottom", "right", "left", "none"].map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {chartType !== "PieChart" && (
            <div style={{ ...row, display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Trục X</label>
                <input style={inp} value={toStr(hAxisTitle)}
                  placeholder="Tiêu đề trục ngang..."
                  onChange={(e) => setProp((p: any) => { p.hAxisTitle = e.target.value; })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Trục Y</label>
                <input style={inp} value={toStr(vAxisTitle)}
                  placeholder="Tiêu đề trục đứng..."
                  onChange={(e) => setProp((p: any) => { p.vAxisTitle = e.target.value; })} />
              </div>
            </div>
          )}

          {chartType === "PieChart" && (
            <div style={row}>
              <label style={lbl}>Pie Hole (0 = solid → 0.9 = donut)</label>
              <input type="range" min={0} max={0.9} step={0.05}
                value={typeof pieHole === "number" ? pieHole : 0.4}
                onChange={(e) => setProp((p: any) => { p.pieHole = parseFloat(e.target.value); })}
                style={{ width: "100%", accentColor: "#6366f1" }} />
              <div style={{ textAlign: "right", color: "#a1a1aa", fontSize: 11 }}>
                {(typeof pieHole === "number" ? pieHole : 0.4).toFixed(2)}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── ADVANCED ── */}
      {tab === "adv" && (
        <>
          <div style={row}>
            <label style={lbl}>
              Options JSON <span style={{ color: "#52525b", fontWeight: 400 }}>— ghi đè, ưu tiên cao nhất</span>
            </label>
            <textarea
              style={{ ...inp, minHeight: 160, resize: "vertical", fontFamily: "monospace", fontSize: 11 }}
              value={localOptionsJson}
              spellCheck={false}
              placeholder={'{\n  "colors": ["#6366f1","#f59e0b"],\n  "legend": { "position": "bottom" },\n  "hAxis": { "title": "Tháng" },\n  "vAxis": { "title": "Triệu đồng" }\n}'}
              onChange={(e) => setLocalOptionsJson(e.target.value)}
              onBlur={applyOptionsJson}
            />
            <button style={applyBtn} onClick={applyOptionsJson}>
              ✅ Áp dụng Options JSON
            </button>
          </div>
          <div style={{
            background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8,
            padding: "10px 12px", fontSize: 11, color: "#71717a", lineHeight: 1.7,
          }}>
            <strong style={{ color: "#f87171" }}>⚠️ Không thêm "animation"</strong> — gây crash.<br />
            Các trường hay dùng:
            <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
              <li><code style={{ color: "#22d3ee" }}>colors</code>: mảng hex</li>
              <li><code style={{ color: "#22d3ee" }}>legend.position</code>: top|right|none</li>
              <li><code style={{ color: "#22d3ee" }}>hAxis / vAxis</code></li>
              <li><code style={{ color: "#22d3ee" }}>pieHole</code>: 0–0.9</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Craft config ─────────────────────────────────────
(GoogleChartsComponent as any).craft = {
  displayName: "Google Chart",
  props: {
    chartType:       "ColumnChart",
    title:           "",
    width:           "100%",
    height:          "360px",
    backgroundColor: "#ffffff",
    colors:          "",
    legendPosition:  "top",
    hAxisTitle:      "",
    vAxisTitle:      "",
    pieHole:         0.4,
    dataJson:        "",
    optionsJson:     "",
  },
  related: { settings: Settings },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
    canMoveOut: () => true,
  },
};
