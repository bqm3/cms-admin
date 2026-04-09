/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-sort-props */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNode } from "@craftjs/core";
import axios from "axios";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface NavItemRaw {
  ID: number;
  CODE: string;
  NAME: string;
  PARENT_CODE: string | null;
  ORDER_NUMBER: number;
  IS_ACTIVE: number;
  [key: string]: any;
}

interface NavTreeNode extends NavItemRaw {
  children: NavTreeNode[];
  depth: number;
}

interface DynamicNavTreeProps {
  url: string;
  method?: "GET" | "POST";
  token?: string;
  payload?: string;

  // appearance
  title?: string;
  width?: number;
  background?: string;
  textColor?: string;
  activeColor?: string;
  hoverBg?: string;
  borderColor?: string;
  radius?: number;
  fontSize?: number;
  iconCollapsed?: string;
  iconExpanded?: string;
  showSearch?: boolean;
  autoFetch?: boolean;
  defaultExpandAll?: boolean;
  showIcons?: boolean;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function safeJson(s?: string) {
  if (!s?.trim()) return {};
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

function buildTree(flat: NavItemRaw[], rootCodes = ["0", null, ""]): NavTreeNode[] {
  const map = new Map<string, NavTreeNode>();
  flat.forEach((item) => {
    map.set(item.CODE, { ...item, children: [], depth: 0 });
  });

  const roots: NavTreeNode[] = [];
  flat.forEach((item) => {
    const node = map.get(item.CODE)!;
    const parentCode = item.PARENT_CODE;

    if (!parentCode || rootCodes.includes(parentCode) || !map.has(parentCode)) {
      node.depth = 0;
      roots.push(node);
    } else {
      const parent = map.get(parentCode)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    }
  });

  // sort by ORDER_NUMBER at each level
  const sortNodes = (nodes: NavTreeNode[]) => {
    nodes.sort((a, b) => (a.ORDER_NUMBER ?? 0) - (b.ORDER_NUMBER ?? 0));
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

function filterTree(nodes: NavTreeNode[], query: string): NavTreeNode[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase();
  const pass = (n: NavTreeNode): NavTreeNode | null => {
    const childMatches = n.children.map(pass).filter(Boolean) as NavTreeNode[];
    const selfMatch = n.NAME.toLowerCase().includes(q) || n.CODE.toLowerCase().includes(q);
    if (selfMatch || childMatches.length > 0) {
      return { ...n, children: childMatches };
    }
    return null;
  };
  return nodes.map(pass).filter(Boolean) as NavTreeNode[];
}

function collectCodes(nodes: NavTreeNode[]): Set<string> {
  const codes = new Set<string>();
  const walk = (ns: NavTreeNode[]) => {
    ns.forEach((n) => {
      codes.add(n.CODE);
      walk(n.children);
    });
  };
  walk(nodes);
  return codes;
}

// ─────────────────────────────────────────────
// Tree node renderer
// ─────────────────────────────────────────────
const INDENT = 16; // px per depth level

const TreeNode: React.FC<{
  node: NavTreeNode;
  expanded: Set<string>;
  active: string | null;
  onToggle: (code: string) => void;
  onSelect: (code: string) => void;
  textColor: string;
  activeColor: string;
  hoverBg: string;
  fontSize: number;
  iconCollapsed: string;
  iconExpanded: string;
  showIcons: boolean;
}> = ({
  node,
  expanded,
  active,
  onToggle,
  onSelect,
  textColor,
  activeColor,
  hoverBg,
  fontSize,
  iconCollapsed,
  iconExpanded,
  showIcons,
}) => {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.CODE);
  const isActive = active === node.CODE;

  const [hovered, setHovered] = useState(false);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingLeft: node.depth * INDENT + 10,
          paddingRight: 10,
          paddingTop: 6,
          paddingBottom: 6,
          cursor: "pointer",
          borderRadius: 6,
          background: isActive
            ? `${activeColor}22`
            : hovered
            ? hoverBg
            : "transparent",
          color: isActive ? activeColor : textColor,
          fontSize,
          fontWeight: isActive ? 600 : 400,
          userSelect: "none",
          transition: "background 0.15s",
          margin: "1px 4px",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          if (hasChildren) onToggle(node.CODE);
          onSelect(node.CODE);
        }}
      >
        {/* expand/collapse icon */}
        <span
          style={{
            width: 16,
            textAlign: "center",
            flexShrink: 0,
            opacity: hasChildren ? 1 : 0,
            fontSize: fontSize - 2,
            transition: "transform 0.2s",
          }}
        >
          {hasChildren ? (isExpanded ? iconExpanded : iconCollapsed) : ""}
        </span>

        {/* folder/page icon */}
        {showIcons && (
          <span style={{ flexShrink: 0, opacity: 0.7, fontSize: fontSize - 1 }}>
            {hasChildren ? (isExpanded ? "📂" : "📁") : "📄"}
          </span>
        )}

        {/* label */}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.NAME}
        </span>

        {/* badge count */}
        {hasChildren && (
          <span
            style={{
              fontSize: fontSize - 3,
              opacity: 0.5,
              flexShrink: 0,
              background: "currentColor",
              color: isActive ? activeColor : textColor,
              padding: "1px 5px",
              borderRadius: 10,
              filter: "invert(1)",
            }}
          >
            {node.children.length}
          </span>
        )}
      </div>

      {/* children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.CODE}
              node={child}
              expanded={expanded}
              active={active}
              onToggle={onToggle}
              onSelect={onSelect}
              textColor={textColor}
              activeColor={activeColor}
              hoverBg={hoverBg}
              fontSize={fontSize}
              iconCollapsed={iconCollapsed}
              iconExpanded={iconExpanded}
              showIcons={showIcons}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export const DynamicNavTreeComponent: React.FC<DynamicNavTreeProps> & { craft?: any } = ({
  url,
  method = "POST",
  token = "",
  payload = "",
  title = "Danh mục",
  width = 280,
  background = "#1e1e2e",
  textColor = "#e2e8f0",
  activeColor = "#6366f1",
  hoverBg = "rgba(255,255,255,0.06)",
  borderColor = "rgba(255,255,255,0.08)",
  radius = 12,
  fontSize = 13,
  iconCollapsed = "▶",
  iconExpanded = "▼",
  showSearch = true,
  autoFetch = true,
  defaultExpandAll = false,
  showIcons = true,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({ selected: node.events.selected }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rawItems, setRawItems] = useState<NavItemRaw[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const parsedPayload = useMemo(() => safeJson(payload), [payload]);

  const fetchData = useCallback(async () => {
    if (!url?.trim()) return;
    try {
      setLoading(true);
      setError("");
      const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "*/*" };
      if (token?.trim()) headers.Authorization = `Bearer ${token.trim()}`;

      const response =
        method === "GET"
          ? await axios.get(url, { headers, params: parsedPayload })
          : await axios.post(url, parsedPayload, { headers });

      const data = response.data;
      const list: NavItemRaw[] =
        Array.isArray(data) ? data :
        Array.isArray(data?.Data) ? data.Data :
        Array.isArray(data?.data) ? data.data :
        [];

      setRawItems(list);

      // auto-expand based on defaultExpandAll prop
      if (defaultExpandAll) {
        const all = new Set<string>();
        list.forEach((i) => {
          if (list.some((j) => j.PARENT_CODE === i.CODE)) all.add(i.CODE);
        });
        setExpanded(all);
      } else {
        // expand only root-level nodes that have children
        const roots = list.filter(
          (i) => !i.PARENT_CODE || i.PARENT_CODE === "0" || !list.find((j) => j.CODE === i.PARENT_CODE)
        );
        const rootCodes = new Set(roots.map((r) => r.CODE));
        const firstLevelExpandable = list.filter(
          (i) => rootCodes.has(i.CODE) && list.some((j) => j.PARENT_CODE === i.CODE)
        );
        setExpanded(new Set(firstLevelExpandable.map((i) => i.CODE)));
      }
    } catch (err: any) {
      setError(err?.response?.data?.Message || err?.message || "API call failed");
      setRawItems([]);
    } finally {
      setLoading(false);
    }
  }, [url, method, token, JSON.stringify(parsedPayload), defaultExpandAll]);

  useEffect(() => {
    if (autoFetch) fetchData();
  }, [fetchData, autoFetch]);

  const tree = useMemo(() => buildTree(rawItems), [rawItems]);
  const filtered = useMemo(() => filterTree(tree, search), [tree, search]);
  const allCodes = useMemo(() => collectCodes(tree), [tree]);

  const handleToggle = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const handleExpandAll = () => setExpanded(new Set(allCodes));
  const handleCollapseAll = () => setExpanded(new Set());

  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      style={{
        width,
        minHeight: 200,
        background,
        borderRadius: radius,
        border: `1px solid ${borderColor}`,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        outline: selected ? `2px solid ${activeColor}` : "none",
        outlineOffset: 2,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 14px 8px",
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: showSearch ? 8 : 0,
          }}
        >
          <div
            style={{
              fontSize: fontSize + 1,
              fontWeight: 700,
              color: textColor,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {showIcons && <span style={{ fontSize: fontSize + 2 }}>🗂️</span>}
            {title}
            {rawItems.length > 0 && (
              <span style={{ fontSize: fontSize - 2, opacity: 0.5, fontWeight: 400 }}>
                ({rawItems.length})
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            <button
              type="button"
              title="Mở tất cả"
              onClick={handleExpandAll}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: textColor,
                opacity: 0.5,
                fontSize: 11,
                padding: "2px 5px",
                borderRadius: 4,
              }}
            >
              ⊞
            </button>
            <button
              type="button"
              title="Thu gọn tất cả"
              onClick={handleCollapseAll}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: textColor,
                opacity: 0.5,
                fontSize: 11,
                padding: "2px 5px",
                borderRadius: 4,
              }}
            >
              ⊟
            </button>
            <button
              type="button"
              title="Tải lại"
              onClick={fetchData}
              disabled={loading}
              style={{
                background: "transparent",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                color: activeColor,
                opacity: loading ? 0.4 : 0.8,
                fontSize: 12,
                padding: "2px 5px",
                borderRadius: 4,
              }}
            >
              {loading ? "⏳" : "↻"}
            </button>
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div style={{ position: "relative" }}>
            {/* <span
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.4,
                fontSize: 12,
                color: textColor,
                pointerEvents: "none",
              }}
            >
            </span> */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "6px 10px 6px 26px",
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                color: textColor,
                fontSize: fontSize - 1,
                outline: "none",
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: textColor,
                  opacity: 0.5,
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "6px 0",
          scrollbarWidth: "thin",
          scrollbarColor: `${borderColor} transparent`,
        }}
      >
        {error ? (
          <div
            style={{
              margin: 12,
              padding: 10,
              borderRadius: 8,
              background: "rgba(239,68,68,0.15)",
              color: "#fca5a5",
              fontSize: fontSize - 1,
            }}
          >
            ⚠️ {error}
          </div>
        ) : loading ? (
          <div style={{ padding: "20px 14px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                width: 20,
                height: 20,
                border: `2px solid ${borderColor}`,
                borderTopColor: activeColor,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <div style={{ color: textColor, opacity: 0.5, fontSize: fontSize - 1, marginTop: 8 }}>
              Đang tải...
            </div>
          </div>
        ) : !url?.trim() ? (
          <div style={{ padding: "20px 14px", color: textColor, opacity: 0.4, fontSize: fontSize - 1, textAlign: "center" }}>
            Chưa cấu hình URL
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "20px 14px", color: textColor, opacity: 0.4, fontSize: fontSize - 1, textAlign: "center" }}>
            {search ? `Không tìm thấy "${search}"` : "Không có dữ liệu"}
          </div>
        ) : (
          filtered.map((node) => (
            <TreeNode
              key={node.CODE}
              node={node}
              expanded={expanded}
              active={active}
              onToggle={handleToggle}
              onSelect={setActive}
              textColor={textColor}
              activeColor={activeColor}
              hoverBg={hoverBg}
              fontSize={fontSize}
              iconCollapsed={iconCollapsed}
              iconExpanded={iconExpanded}
              showIcons={showIcons}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {active && (
        <div
          style={{
            padding: "8px 14px",
            borderTop: `1px solid ${borderColor}`,
            flexShrink: 0,
            fontSize: fontSize - 2,
            color: activeColor,
            opacity: 0.8,
            display: "flex",
            alignItems: "center",
            gap: 4,
            overflow: "hidden",
          }}
        >
          <span style={{ flexShrink: 0 }}>▸</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {rawItems.find((i) => i.CODE === active)?.NAME ?? active}
          </span>
        </div>
      )}

      {/* CSS for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
// Settings panel
// ─────────────────────────────────────────────
const DynamicNavTreeSettings = () => {
  const {
    url, method, token, payload, title, width, background, textColor,
    activeColor, hoverBg, borderColor, radius, fontSize, showSearch,
    autoFetch, defaultExpandAll, showIcons,
    actions: { setProp },
  } = useNode((node) => ({
    url: node.data.props.url,
    method: node.data.props.method,
    token: node.data.props.token,
    payload: node.data.props.payload,
    title: node.data.props.title,
    width: node.data.props.width,
    background: node.data.props.background,
    textColor: node.data.props.textColor,
    activeColor: node.data.props.activeColor,
    hoverBg: node.data.props.hoverBg,
    borderColor: node.data.props.borderColor,
    radius: node.data.props.radius,
    fontSize: node.data.props.fontSize,
    showSearch: node.data.props.showSearch,
    autoFetch: node.data.props.autoFetch,
    defaultExpandAll: node.data.props.defaultExpandAll,
    showIcons: node.data.props.showIcons,
  }));

  const input = (label: string, key: string, value: any, type = "text", placeholder = "") => (
    <div>
      <label className="text-xs text-zinc-400 block mb-1">{label}</label>
      <input
        type={type}
        className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) =>
          setProp((p: any) => (p[key] = type === "number" ? Number(e.target.value) : e.target.value))
        }
      />
    </div>
  );

  const toggle = (label: string, key: string, value: any) => (
    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => setProp((p: any) => (p[key] = e.target.checked))}
      />
      {label}
    </label>
  );

  return (
    <div className="space-y-3 text-white">
      <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold pb-1 border-b border-white/10">
        API Settings
      </div>
      {input("Title", "title", title)}
      {input("URL", "url", url, "text", "https://api.example.com/...")}

      <div>
        <label className="text-xs text-zinc-400 block mb-1">Method</label>
        <select
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
          value={method ?? "POST"}
          onChange={(e) => setProp((p: any) => (p.method = e.target.value))}
        >
          <option value="POST">POST</option>
          <option value="GET">GET</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">Bearer Token</label>
        <textarea
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded min-h-[60px]"
          value={token ?? ""}
          onChange={(e) => setProp((p: any) => (p.token = e.target.value))}
          placeholder="eyJ..."
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">Payload JSON</label>
        <textarea
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded min-h-[80px]"
          value={payload ?? ""}
          onChange={(e) => setProp((p: any) => (p.payload = e.target.value))}
          placeholder='{"STATUS":1,"IS_ACTIVE":1,"IS_DELETE":0}'
        />
      </div>

      <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold pb-1 border-b border-white/10 pt-2">
        Appearance
      </div>

      <div className="grid grid-cols-2 gap-2">
        {input("Width (px)", "width", width, "number")}
        {input("Font size (px)", "fontSize", fontSize, "number")}
        {input("Radius (px)", "radius", radius, "number")}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {input("Background", "background", background)}
        {input("Text color", "textColor", textColor)}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {input("Active color", "activeColor", activeColor)}
        {input("Hover bg", "hoverBg", hoverBg)}
      </div>

      {input("Border color", "borderColor", borderColor)}

      <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold pb-1 border-b border-white/10 pt-2">
        Behavior
      </div>

      <div className="space-y-2">
        {toggle("Auto-fetch on load", "autoFetch", autoFetch)}
        {toggle("Show search bar", "showSearch", showSearch)}
        {toggle("Show folder icons", "showIcons", showIcons)}
        {toggle("Expand all by default", "defaultExpandAll", defaultExpandAll)}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Craft config
// ─────────────────────────────────────────────
(DynamicNavTreeComponent as any).craft = {
  displayName: "Nav Tree",
  props: {
    url: "",
    method: "POST",
    token: "",
    payload: '{"STATUS":1,"IS_ACTIVE":1,"IS_DELETE":0}',
    title: "Danh mục",
    width: 280,
    background: "#1e1e2e",
    textColor: "#e2e8f0",
    activeColor: "#6366f1",
    hoverBg: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.08)",
    radius: 12,
    fontSize: 13,
    iconCollapsed: "▶",
    iconExpanded: "▼",
    showSearch: true,
    autoFetch: true,
    defaultExpandAll: false,
    showIcons: true,
  },
  related: {
    settings: DynamicNavTreeSettings,
  },
};
