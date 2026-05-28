/* eslint-disable react/no-children-prop */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-sort-props */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNode } from "@craftjs/core";
import axios from "axios";
import { embedDashboard } from "@superset-ui/embedded-sdk";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface DashboardItem {
  ID?: number;
  CODE: string;
  NAME: string;
  PARENT_CODE?: string | null;
  PARENT_NAME?: string | null;
  ORDER_NUMBER?: number;
  DAB_TYPE?: string;
  DESCRIPTION?: string;
  IS_ACTIVE?: number;
  IS_DELETE?: number;
  ORG?: string;
  [key: string]: any;
}

interface AuthorItem {
  AUT_CODE: string;
  ACCOUNT: string;
  TYPE_CODE?: string;
  [key: string]: any;
}

interface DashboardGroup {
  CODE: string;
  NAME: string;
  items: DashboardItem[];
}

interface SupersetDashboardProps {
  dashboardUrl: string;
  authorUrl: string;
  guestTokenUrl: string;
  supersetDomain: string;
  bearerToken?: string;
  username?: string;
  panelWidth?: number;
  panelBackground?: string;
  panelTextColor?: string;
  panelActiveColor?: string;
  panelHoverBg?: string;
  panelBorderColor?: string;
  panelRadius?: number;
  panelFontSize?: number;
  showSearch?: boolean;
  showDragHandles?: boolean;
  autoFetch?: boolean;
  height?: number;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function safeJson(s?: string): any {
  if (!s?.trim()) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function extractList(d: any): any[] {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.Data)) return d.Data;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}

function buildGroups(dashboards: DashboardItem[]): DashboardGroup[] {
  const groupMap = new Map<string, DashboardGroup>();
  const ungrouped: DashboardItem[] = [];

  dashboards.forEach((d) => {
    if (!d.PARENT_CODE) {
      ungrouped.push(d);
      return;
    }
    if (!groupMap.has(d.PARENT_CODE)) {
      groupMap.set(d.PARENT_CODE, {
        CODE: d.PARENT_CODE,
        NAME: d.PARENT_NAME || d.PARENT_CODE,
        items: [],
      });
    }
    groupMap.get(d.PARENT_CODE)!.items.push(d);
  });

  groupMap.forEach((g) => {
    g.items.sort((a, b) => (a.ORDER_NUMBER ?? 0) - (b.ORDER_NUMBER ?? 0));
  });

  const groups = Array.from(groupMap.values());
  if (ungrouped.length > 0) {
    groups.push({ CODE: "__ungrouped__", NAME: "Khác", items: ungrouped });
  }
  return groups;
}

// ─────────────────────────────────────────────
// DragHandle
// ─────────────────────────────────────────────
const DragHandle: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 3,
      cursor: "grab",
      padding: "0 4px",
      flexShrink: 0,
      opacity: 0.4,
    }}
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          display: "block",
          width: 14,
          height: 1.5,
          borderRadius: 2,
          background: color,
        }}
      />
    ))}
  </span>
);

// ─────────────────────────────────────────────
// GroupSection
// ─────────────────────────────────────────────
interface GroupSectionProps {
  group: DashboardGroup;
  activeCode: string | null;
  onSelect: (item: DashboardItem) => void;
  onReorder: (groupCode: string, newItems: DashboardItem[]) => void;
  showDragHandles: boolean;
  textColor: string;
  activeColor: string;
  hoverBg: string;
  fontSize: number;
  borderColor: string;
  lockedCodes: Set<string>;
}

const GroupSection: React.FC<GroupSectionProps> = ({
  group,
  activeCode,
  onSelect,
  onReorder,
  showDragHandles,
  textColor,
  activeColor,
  hoverBg,
  fontSize,
  borderColor,
  lockedCodes,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [list, setList] = useState<DashboardItem[]>(group.items);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const dragIdxRef = useRef<number | null>(null);

  useEffect(() => {
    setList(group.items);
  }, [group.items]);

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    const fromIdx = dragIdxRef.current;
    if (fromIdx === null || fromIdx === dropIdx) {
      setDragOverIdx(null);
      dragIdxRef.current = null;
      return;
    }
    const next = [...list];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(dropIdx, 0, moved);
    setList(next);
    dragIdxRef.current = null;
    setDragOverIdx(null);
    onReorder(group.CODE, next);
  };

  return (
    <div style={{ marginBottom: 2 }}>
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          cursor: "pointer",
          userSelect: "none",
          color: textColor,
          fontSize,
          fontWeight: 700,
          opacity: 0.65,
          letterSpacing: "0.03em",
        }}
      >
        <span
          style={{
            fontSize: fontSize - 3,
            display: "inline-block",
            transition: "transform 0.18s",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          ▶
        </span>
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {group.NAME}
        </span>
        {list.length > 0 && (
          <span
            style={{
              fontSize: fontSize - 3,
              background: `${textColor}22`,
              borderRadius: 10,
              padding: "1px 6px",
              fontWeight: 400,
            }}
          >
            {list.length}
          </span>
        )}
      </div>

      {expanded && (
        <div>
          {list.map((item, idx) => {
            const isActive = activeCode === item.CODE;
            const isDragOver = dragOverIdx === idx;
            const isHovered = hoveredCode === item.CODE;
            const isLocked = lockedCodes.has(item.CODE);
            return (
              <div
                key={item.CODE}
                draggable={showDragHandles && !isLocked}
                onDragStart={() => {
                  dragIdxRef.current = idx;
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIdx(idx);
                }}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={() => {
                  dragIdxRef.current = null;
                  setDragOverIdx(null);
                }}
                onMouseEnter={() => setHoveredCode(item.CODE)}
                onMouseLeave={() => setHoveredCode(null)}
                onClick={() => !isLocked && onSelect(item)}
                title={
                  isLocked ? "Bạn không có quyền xem dashboard này" : item.NAME
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  margin: "1px 8px",
                  padding: "6px 8px",
                  borderRadius: 7,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  background: isActive
                    ? `${activeColor}20`
                    : isDragOver
                      ? `${activeColor}12`
                      : isHovered && !isLocked
                        ? hoverBg
                        : "transparent",
                  border: isDragOver
                    ? `1.5px dashed ${activeColor}88`
                    : "1.5px solid transparent",
                  color: isLocked
                    ? `${textColor}44`
                    : isActive
                      ? activeColor
                      : textColor,
                  fontSize,
                  fontWeight: isActive ? 600 : 400,
                  transition: "background 0.12s, color 0.12s",
                  userSelect: "none",
                  opacity: isLocked ? 0.45 : 1,
                }}
              >
                {showDragHandles && !isLocked && (
                  <DragHandle color={isActive ? activeColor : textColor} />
                )}
                {isLocked && (
                  <span
                    style={{
                      fontSize: fontSize - 2,
                      flexShrink: 0,
                      opacity: 0.5,
                    }}
                  >
                    🔒
                  </span>
                )}
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingLeft: 2,
                  }}
                >
                  {item.NAME}
                </span>
                {isActive && !isLocked && (
                  <span
                    style={{
                      fontSize: fontSize - 3,
                      color: activeColor,
                      flexShrink: 0,
                    }}
                  >
                    ●
                  </span>
                )}
              </div>
            );
          })}
          {list.length === 0 && (
            <div
              style={{
                padding: "4px 28px 8px",
                color: textColor,
                opacity: 0.3,
                fontSize: fontSize - 2,
                fontStyle: "italic",
              }}
            >
              Không có dashboard
            </div>
          )}
        </div>
      )}
      <div
        style={{
          height: 1,
          background: borderColor,
          margin: "4px 12px",
          opacity: 0.3,
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export const SupersetDashboardComponent: React.FC<SupersetDashboardProps> & {
  craft?: any;
} = ({
  dashboardUrl = "",
  authorUrl = "",
  guestTokenUrl = "",
  supersetDomain = "https://dev-dash.cdsdservice.com",
  bearerToken = "",
  username = "",
  panelWidth = 280,
  panelBackground = "#1a1d2e",
  panelTextColor = "#e2e8f0",
  panelActiveColor = "#6366f1",
  panelHoverBg = "rgba(255,255,255,0.06)",
  panelBorderColor = "rgba(255,255,255,0.1)",
  panelRadius = 12,
  panelFontSize = 13,
  showSearch = true,
  showDragHandles = true,
  autoFetch = true,
  height = 640,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({ selected: node.events.selected }));

  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [groups, setGroups] = useState<DashboardGroup[]>([]);
  const [activeItem, setActiveItem] = useState<DashboardItem | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [embedLoading, setEmbedLoading] = useState(false);
  const [error, setError] = useState("");

  // ── ref cho mount point của embedDashboard ───────────────
  const mountRef = useRef<HTMLDivElement>(null);
  // ── lưu supersetId hiện tại để interval refresh token ───
  const activeIdRef = useRef<string>("");
  const tokenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── auth headers ─────────────────────────────────────────
  const authHeaders = useMemo(() => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "*/*",
    };
    if (bearerToken?.trim()) h.Authorization = `Bearer ${bearerToken.trim()}`;
    return h;
  }, [bearerToken]);

  // ── fetch helper ─────────────────────────────────────────
  const post = useCallback(
    async (url: string, body: any = {}) => {
      if (!url?.trim()) return [];
      const res = await axios.post(url, body, { headers: authHeaders });
      return extractList(res.data);
    },
    [authHeaders],
  );

  // ── load dashboard list ──────────────────────────────────
  const loadData = useCallback(async () => {
    if (!dashboardUrl?.trim()) return;
    try {
      setLoading(true);
      setError("");
      const [dashs, auths] = await Promise.all([
        post(dashboardUrl, { IS_ACTIVE: 1, IS_DELETE: 0 }),
        authorUrl?.trim()
          ? post(authorUrl, {
              TYPE_CODE: "DASHBOARD",
              IS_ACTIVE: 1,
              IS_DELETE: 0,
            })
          : Promise.resolve([]),
      ]);
      setDashboards(dashs);
      setAuthors(auths);
      setGroups(buildGroups(dashs));
    } catch (err: any) {
      setError(
        err?.response?.data?.Message || err?.message || "Lỗi tải dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  }, [dashboardUrl, authorUrl, post]);

  useEffect(() => {
    if (autoFetch) loadData();
  }, [loadData, autoFetch]);

  // ── ACL ──────────────────────────────────────────────────
  const lockedCodes = useMemo<Set<string>>(() => {
    if (!username?.trim() || authors.length === 0) return new Set();
    const allowed = new Set(
      authors
        .filter((a) => a.ACCOUNT === username && a.TYPE_CODE === "DASHBOARD")
        .map((a) => a.AUT_CODE),
    );
    const locked = new Set<string>();
    dashboards.forEach((d) => {
      const hasAcl = authors.some((a) => a.AUT_CODE === d.CODE);
      if (hasAcl && !allowed.has(d.CODE)) locked.add(d.CODE);
    });
    return locked;
  }, [authors, username, dashboards]);

  const fetchSupersetAccessToken = async (): Promise<string> => {
    try {
      const base =
        window.location.hostname === "localhost"
          ? "/superset"
          : supersetDomain.replace(/\/$/, "");

      const res = await axios.post(`${base}/api/v1/security/login`, {
        username: "admin",
        password: "admin",
        provider: "db",
      });

      return res.data?.access_token || "";
    } catch (err) {
      console.error("fetchSupersetAccessToken failed:", err);
      return "";
    }
  };

  // ── gọi API lấy guest token thật ────────────────────────
  const fetchGuestToken = useCallback(
    async (sId: string): Promise<string> => {
      if (!sId) return "";

      try {
        const base =
          window.location.hostname === "localhost"
            ? "/superset"
            : supersetDomain.replace(/\/$/, "");

        const accessToken = await fetchSupersetAccessToken();
        if (!accessToken) return "";

        const res = await axios.post(
          `${base}/api/v1/security/guest_token/`,
          {
            resources: [{ type: "dashboard", id: sId }],
            rls: [],
            user: {
              username: "guest",
              first_name: "Guest",
              last_name: "User",
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        return res.data?.token ?? "";
      } catch (err: any) {
        console.error("fetchGuestToken failed:", err?.response?.data || err);
        return "";
      }
    },
    [supersetDomain],
  );

  // ── embed dashboard bằng SDK ─────────────────────────────
  const doEmbed = useCallback(
    async (item: DashboardItem) => {
      const desc = safeJson(item.DESCRIPTION);
      const dashboardUuid = desc?.id ? String(desc.id) : "";

      if (!dashboardUuid) {
        setError("Dashboard chưa có UUID hợp lệ trong DESCRIPTION.id");
        return;
      }

      if (!mountRef.current) return;

      setError("");
      setEmbedLoading(true);
      mountRef.current.innerHTML = "";

      try {
        const finalDomain =
          window.location.hostname === "localhost"
            ? `${window.location.origin}/superset`
            : supersetDomain.replace(/\/$/, "");

        await embedDashboard({
          id: dashboardUuid,
          supersetDomain: "https://dev-dash.cdsdservice.com",
          mountPoint: mountRef.current,
          fetchGuestToken: async () => {
            const accessToken = await fetchSupersetAccessToken();

            const res = await axios.post(
              "/superset/api/v1/security/guest_token/",
              {
                resources: [{ type: "dashboard", id: dashboardUuid }],
                rls: [],
                user: {
                  username: "guest",
                  first_name: "Guest",
                  last_name: "User",
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              },
            );

            return res.data?.token || "";
          },
        });

        const iframe = mountRef.current.querySelector("iframe");
        console.log("iframe created =", iframe);

        if (iframe) {
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.border = "none";
        }
      } catch (err: any) {
        console.error("embed error:", err?.response?.data || err);
        setError(err?.message || "Không thể hiển thị dashboard");
      } finally {
        setEmbedLoading(false);
      }
    },
    [supersetDomain],
  );

  // ── cleanup interval khi unmount ─────────────────────────
  useEffect(() => {
    return () => {
      if (tokenIntervalRef.current) clearInterval(tokenIntervalRef.current);
    };
  }, []);

  // ── chọn dashboard ───────────────────────────────────────
  const handleSelect = useCallback(
    (item: DashboardItem) => {
      if (lockedCodes.has(item.CODE)) return;
      setActiveItem(item);
      doEmbed(item);
    },
    [lockedCodes, doEmbed],
  );

  // ── drag-reorder ─────────────────────────────────────────
  const handleReorder = useCallback(
    (groupCode: string, newItems: DashboardItem[]) => {
      setGroups((prev) =>
        prev.map((g) => (g.CODE === groupCode ? { ...g, items: newItems } : g)),
      );
    },
    [],
  );

  // ── search filter ────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (d) =>
            d.NAME?.toLowerCase().includes(q) ||
            d.CODE?.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0 || g.NAME?.toLowerCase().includes(q));
  }, [groups, search]);

  // ────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────
  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      style={{
        display: "flex",
        width: "100%",
        height,
        border: `1px solid ${panelBorderColor}`,
        borderRadius: panelRadius,
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
        outline: selected ? `2px solid ${panelActiveColor}` : "none",
        outlineOffset: 2,
        boxSizing: "border-box",
      }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        style={{
          width: panelWidth,
          minWidth: panelWidth,
          maxWidth: panelWidth,
          background: panelBackground,
          borderRight: `1px solid ${panelBorderColor}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 14px 10px",
            borderBottom: `1px solid ${panelBorderColor}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: showSearch ? 10 : 0,
            }}
          >
            <span
              style={{
                fontSize: panelFontSize + 1,
                fontWeight: 700,
                color: panelTextColor,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              📊 Dashboard
            </span>
            <button
              type="button"
              title="Tải lại"
              onClick={loadData}
              disabled={loading}
              style={{
                background: "transparent",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                color: panelActiveColor,
                fontSize: 15,
                padding: "2px 6px",
                borderRadius: 4,
                opacity: loading ? 0.4 : 0.85,
              }}
            >
              {loading ? "⏳" : "↻"}
            </button>
          </div>

          {showSearch && (
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  opacity: 0.35,
                  fontSize: 11,
                  color: panelTextColor,
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm dashboard..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "6px 26px 6px 26px",
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${panelBorderColor}`,
                  borderRadius: 8,
                  color: panelTextColor,
                  fontSize: panelFontSize - 1,
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
                    color: panelTextColor,
                    opacity: 0.5,
                    fontSize: 11,
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
            padding: "8px 0",
            scrollbarWidth: "thin",
            scrollbarColor: `${panelBorderColor} transparent`,
          }}
        >
          {error && !activeItem ? (
            <div
              style={{
                margin: 12,
                padding: 10,
                borderRadius: 8,
                background: "rgba(239,68,68,0.15)",
                color: "#fca5a5",
                fontSize: panelFontSize - 1,
              }}
            >
              ⚠️ {error}
            </div>
          ) : loading ? (
            <div style={{ padding: 20, textAlign: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  width: 20,
                  height: 20,
                  border: `2px solid ${panelBorderColor}`,
                  borderTopColor: panelActiveColor,
                  borderRadius: "50%",
                  animation: "sdSpin 0.8s linear infinite",
                }}
              />
              <div
                style={{
                  color: panelTextColor,
                  opacity: 0.5,
                  fontSize: panelFontSize - 1,
                  marginTop: 8,
                }}
              >
                Đang tải...
              </div>
            </div>
          ) : !dashboardUrl?.trim() ? (
            <div
              style={{
                padding: "20px 14px",
                color: panelTextColor,
                opacity: 0.35,
                fontSize: panelFontSize - 1,
                textAlign: "center",
              }}
            >
              Chưa cấu hình Dashboard URL
            </div>
          ) : filteredGroups.length === 0 ? (
            <div
              style={{
                padding: "20px 14px",
                color: panelTextColor,
                opacity: 0.35,
                fontSize: panelFontSize - 1,
                textAlign: "center",
              }}
            >
              {search ? `Không tìm thấy "${search}"` : "Không có dữ liệu"}
            </div>
          ) : (
            filteredGroups.map((g) => (
              <GroupSection
                key={g.CODE}
                group={g}
                activeCode={activeItem?.CODE ?? null}
                onSelect={handleSelect}
                onReorder={handleReorder}
                showDragHandles={showDragHandles}
                textColor={panelTextColor}
                activeColor={panelActiveColor}
                hoverBg={panelHoverBg}
                fontSize={panelFontSize}
                borderColor={panelBorderColor}
                lockedCodes={lockedCodes}
              />
            ))
          )}
        </div>

        {activeItem && (
          <div
            style={{
              padding: "8px 14px",
              borderTop: `1px solid ${panelBorderColor}`,
              flexShrink: 0,
              fontSize: panelFontSize - 2,
              color: panelActiveColor,
              opacity: 0.85,
              display: "flex",
              alignItems: "center",
              gap: 4,
              overflow: "hidden",
            }}
          >
            <span style={{ flexShrink: 0 }}>▸</span>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activeItem.NAME}
            </span>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        style={{
          flex: 1,
          background: "#f9fafb",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Trạng thái chưa chọn */}
        {!activeItem && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#9ca3af",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 52, opacity: 0.2 }}>📊</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              Chọn một dashboard từ danh sách bên trái
            </span>
          </div>
        )}

        {/* Loading overlay khi đang embed */}
        {embedLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(249,250,251,0.85)",
              zIndex: 5,
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: `3px solid #e5e7eb`,
                borderTopColor: panelActiveColor,
                borderRadius: "50%",
                animation: "sdSpin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Đang tải dashboard...
            </span>
          </div>
        )}

        {/* Error overlay */}
        {error && activeItem && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#9ca3af",
            }}
          >
            <span style={{ fontSize: 36, opacity: 0.3 }}>⚠️</span>
            <span style={{ fontSize: 13 }}>{error}</span>
          </div>
        )}

        {/* Mount point — embedDashboard sẽ inject iframe vào đây */}
        <div
          ref={mountRef}
          style={{
            width: "100%",
            height: "100%",
            visibility: "visible",
          }}
        />
      </div>

      <style>{`@keyframes sdSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
// Settings panel
// ─────────────────────────────────────────────
const SupersetDashboardSettings = () => {
  const {
    dashboardUrl,
    authorUrl,
    guestTokenUrl,
    supersetDomain,
    bearerToken,
    username,
    panelWidth,
    panelBackground,
    panelTextColor,
    panelActiveColor,
    panelHoverBg,
    panelBorderColor,
    panelRadius,
    panelFontSize,
    showSearch,
    showDragHandles,
    autoFetch,
    height,
    actions: { setProp },
  } = useNode((node) => ({
    dashboardUrl: node.data.props.dashboardUrl,
    authorUrl: node.data.props.authorUrl,
    guestTokenUrl: node.data.props.guestTokenUrl,
    supersetDomain: node.data.props.supersetDomain,
    bearerToken: node.data.props.bearerToken,
    username: node.data.props.username,
    panelWidth: node.data.props.panelWidth,
    panelBackground: node.data.props.panelBackground,
    panelTextColor: node.data.props.panelTextColor,
    panelActiveColor: node.data.props.panelActiveColor,
    panelHoverBg: node.data.props.panelHoverBg,
    panelBorderColor: node.data.props.panelBorderColor,
    panelRadius: node.data.props.panelRadius,
    panelFontSize: node.data.props.panelFontSize,
    showSearch: node.data.props.showSearch,
    showDragHandles: node.data.props.showDragHandles,
    autoFetch: node.data.props.autoFetch,
    height: node.data.props.height,
  }));

  const inp = (
    label: string,
    key: string,
    value: any,
    type = "text",
    placeholder = "",
  ) => (
    <div>
      <label className="text-xs text-zinc-400 block mb-1">{label}</label>
      <input
        type={type}
        className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) =>
          setProp(
            (p: any) =>
              (p[key] =
                type === "number" ? Number(e.target.value) : e.target.value),
          )
        }
      />
    </div>
  );

  const ta = (label: string, key: string, value: any, placeholder = "") => (
    <div>
      <label className="text-xs text-zinc-400 block mb-1">{label}</label>
      <textarea
        className="w-full bg-zinc-800 text-white text-xs p-2 rounded min-h-[52px]"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => setProp((p: any) => (p[key] = e.target.value))}
      />
    </div>
  );

  const tog = (label: string, key: string, value: any) => (
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
        API Config
      </div>
      {ta(
        "Dashboard URL (POST)",
        "dashboardUrl",
        dashboardUrl,
        "https://dev-api.cdsdservice.com/microservice-governance/api/SYS_DM_DASHBOARD/GetListBy",
      )}
      {ta(
        "Author URL (POST) — tuỳ chọn (ACL)",
        "authorUrl",
        authorUrl,
        "https://dev-api.cdsdservice.com/microservice-governance/api/SYS_SYSTEM_AUTHOR/GetListBy",
      )}
      {ta(
        "Guest Token URL (POST)",
        "guestTokenUrl",
        guestTokenUrl,
        "https://dev-gvn.cdsdservice.com/api/v1/custom/guest-token",
      )}
      {inp(
        "Superset Domain",
        "supersetDomain",
        supersetDomain,
        "text",
        "https://dev-dash.cdsdservice.com",
      )}
      {inp("Username (để lọc ACL)", "username", username, "text", "hcm.admin")}
      <div>
        <label className="text-xs text-zinc-400 block mb-1">Bearer Token</label>
        <textarea
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded min-h-[52px]"
          value={bearerToken ?? ""}
          onChange={(e) =>
            setProp((p: any) => (p.bearerToken = e.target.value))
          }
          placeholder="eyJ..."
        />
      </div>

      <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold pb-1 border-b border-white/10 pt-2">
        Appearance
      </div>
      <div className="grid grid-cols-2 gap-2">
        {inp("Panel width (px)", "panelWidth", panelWidth, "number")}
        {inp("Height (px)", "height", height, "number")}
        {inp("Font size", "panelFontSize", panelFontSize, "number")}
        {inp("Border radius", "panelRadius", panelRadius, "number")}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {inp("Panel BG", "panelBackground", panelBackground)}
        {inp("Text color", "panelTextColor", panelTextColor)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {inp("Active color", "panelActiveColor", panelActiveColor)}
        {inp("Hover BG", "panelHoverBg", panelHoverBg)}
      </div>
      {inp("Border color", "panelBorderColor", panelBorderColor)}

      <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold pb-1 border-b border-white/10 pt-2">
        Behavior
      </div>
      <div className="space-y-2">
        {tog("Auto-fetch khi load", "autoFetch", autoFetch)}
        {tog("Hiện thanh tìm kiếm", "showSearch", showSearch)}
        {tog("Hiện tay cầm kéo thả", "showDragHandles", showDragHandles)}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Craft config
// ─────────────────────────────────────────────
(SupersetDashboardComponent as any).craft = {
  displayName: "Superset Dashboard",
  props: {
    dashboardUrl:
      "https://dev-api.cdsdservice.com/microservice-governance/api/SYS_DM_DASHBOARD/GetListBy",
    authorUrl:
      "https://dev-api.cdsdservice.com/microservice-governance/api/SYS_SYSTEM_AUTHOR/GetListBy",
    guestTokenUrl: "https://dev-gvn.cdsdservice.com/api/v1/custom/guest-token",
    supersetDomain: "https://dev-dash.cdsdservice.com",
    bearerToken: "",
    username: "",
    panelWidth: 280,
    panelBackground: "#1a1d2e",
    panelTextColor: "#e2e8f0",
    panelActiveColor: "#6366f1",
    panelHoverBg: "rgba(255,255,255,0.06)",
    panelBorderColor: "rgba(255,255,255,0.1)",
    panelRadius: 12,
    panelFontSize: 13,
    showSearch: true,
    showDragHandles: true,
    autoFetch: true,
    height: 640,
  },
  related: {
    settings: SupersetDashboardSettings,
  },
};
