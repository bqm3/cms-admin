/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-sort-props */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Element, useNode, useEditor } from "@craftjs/core";
import { X } from "lucide-react";

import { Container } from "./Container";
import { useEditorMode } from "../utils/useEditorMode";

import { HeadingComponent } from "./HeadingComponent";
import { TextComponent } from "./TextComponent";
import { ButtonComponent } from "./ButtonComponent";
import { InputComponent } from "./InputComponent";
import { POPUP_BUS_EVENT, PopupBusDetail } from "../utils/popupBus";

type PopupOfferComponentProps = {
  popupId?: string;
  enabled?: boolean;

  delayMs?: number;
  storageKey?: string;
  openOnce?: boolean;

  teaserEnabled?: boolean;
  teaserText?: string;
  teaserWidth?: number;
  teaserOffsetX?: number;
  teaserOffsetY?: number;

  modalWidth?: number;
  modalRadius?: number;
  backdropOpacity?: number;
  dismissOnOverlayClick?: boolean;
  zIndex?: number;

  showEditorPreview?: boolean;
  syncTeaserWithTitle?: boolean;
};

export const PopupOfferComponent: React.FC<PopupOfferComponentProps> & {
  craft: any;
} = ({
  enabled = true,
   popupId = "popup_default",
  delayMs = 5000,
  storageKey = "promo_popup_seen_v2",
  openOnce = true,

  teaserEnabled = true,
  teaserText = "GET DISCOUNT!",
  teaserWidth = 260,
  teaserOffsetX = 18,
  teaserOffsetY = 18,

  modalWidth = 560,
  modalRadius = 16,
  backdropOpacity = 0.55,
  dismissOnOverlayClick = true,
  zIndex = 80,

  showEditorPreview = true,
  syncTeaserWithTitle = true,
}) => {
  const editorEnabled = useEditorMode();
  const { query } = useEditor();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeaserOpen, setIsTeaserOpen] = useState(false);

  const {
    connectors: { connect, drag },
    selected,
    id: nodeId,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  // ✅ Tự động sync teaser text với heading đầu tiên trong popup
  const actualTeaserText = useMemo(() => {
    if (!syncTeaserWithTitle) return teaserText;

    try {
      const node = query.node(nodeId).get();
      if (!node?.data?.nodes || node.data.nodes.length === 0) {
        return teaserText;
      }

      // Tìm Element canvas container
      const canvasNodeId = node.data.nodes[0];
      const canvasNode = query.node(canvasNodeId).get();
      
      if (!canvasNode?.data?.nodes || canvasNode.data.nodes.length === 0) {
        return teaserText;
      }

      // Tìm HeadingComponent đầu tiên
      for (const childId of canvasNode.data.nodes) {
        const childNode = query.node(childId).get();
        const displayName = childNode?.data?.displayName;
        
        if (displayName === "Heading" || displayName === "HeadingComponent") {
          const headingText = childNode?.data?.props?.text;
          if (headingText && typeof headingText === "string") {
            return headingText;
          }
        }
      }
    } catch (err) {
      console.warn("Could not sync teaser with title:", err);
    }

    return teaserText;
  }, [syncTeaserWithTitle, teaserText, nodeId, query]);

  const resolvedStorageKey = useMemo(() => {
  const base = storageKey || "promo_popup_seen";
  return `${base}:${popupId}`;
}, [storageKey, popupId]);

const seen = useMemo(() => {
  if (!openOnce) return false;
  try {
    return localStorage.getItem(resolvedStorageKey) === "1";
  } catch {
    return false;
  }
}, [openOnce, resolvedStorageKey]);

const markSeen = useCallback(() => {
  if (!openOnce) return;
  try {
    localStorage.setItem(resolvedStorageKey, "1");
  } catch {}
}, [openOnce, resolvedStorageKey]);

const closeModalToTeaser = useCallback(() => {
  setIsModalOpen(false);
  setIsTeaserOpen(true);
  markSeen();
}, [markSeen]);

   useEffect(() => {
  if (editorEnabled) return;

  const onBus = (ev: Event) => {
    const e = ev as CustomEvent<PopupBusDetail>;
    const d = e.detail;
    if (!d) return;

    if (d.type === "closeAll") {
      setIsModalOpen(false);
      setIsTeaserOpen(false);
      return;
    }

    if ("popupId" in d && d.popupId !== popupId) return;

    if (d.type === "open") {
      setIsModalOpen(true);
      setIsTeaserOpen(false);
      markSeen();
    }

    if (d.type === "close") {
      closeModalToTeaser();
    }
  };

  window.addEventListener(POPUP_BUS_EVENT, onBus as any);
  return () => window.removeEventListener(POPUP_BUS_EVENT, onBus as any);
}, [editorEnabled, popupId, markSeen, closeModalToTeaser]);

// Thêm vào sau useEffect của popup bus
useEffect(() => {
  if (!enabled) return;

  if (editorEnabled) {
    // Trong editor: chỉ hiện teaser
    setIsModalOpen(false);
    setIsTeaserOpen(true);
    return;
  }

  // Runtime: kiểm tra đã xem chưa
  if (seen) {
    setIsModalOpen(false);
    setIsTeaserOpen(true);
    return;
  }

  // Nếu chưa xem và có delay, đợi rồi mở
  if (delayMs > 0) {
    const t = window.setTimeout(() => {
      setIsModalOpen(true);
      setIsTeaserOpen(false);
      markSeen();
    }, delayMs);
    return () => window.clearTimeout(t);
  }
}, [enabled, editorEnabled, seen, delayMs, markSeen]);


  // useEffect(() => {
  //   if (!enabled) return;

  //   if (editorEnabled) {
  //     setIsModalOpen(false);
  //     setIsTeaserOpen(true);
  //     return;
  //   }

  //   if (seen) {
  //     setIsModalOpen(false);
  //     setIsTeaserOpen(true);
  //     return;
  //   }

  //   const t = window.setTimeout(
  //     () => {
  //       setIsModalOpen(true);
  //       setIsTeaserOpen(false);
  //       markSeen();
  //     },
  //     Math.max(0, delayMs),
  //   );

  //   return () => window.clearTimeout(t);
  // }, [enabled, editorEnabled, seen, delayMs]);

  const openModal = () => {
    setIsModalOpen(true);
    setIsTeaserOpen(false);
    markSeen();
  };


  if (!enabled) return null;

 // Thêm vào EditorPreview, ngay sau phần "Drag here"
// Sửa lại EditorPreview
const EditorPreview = () => {
  if (!editorEnabled || !showEditorPreview) return null;

  return (
    <div className="mt-4 w-full">
      <div
        className={[
          "w-full max-w-[720px] rounded-2xl border border-white/10 bg-zinc-900/40 p-4",
          selected ? "outline outline-2 outline-indigo-500/60" : "",
        ].join(" ")}
      >
        {/* CONTROL PANEL */}
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="text-xs font-semibold text-blue-300 mb-2">
            Popup Settings (Click box này để edit)
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
            <div>
              <span className="text-white/50">Popup ID:</span>
              <span className="ml-2 font-mono text-blue-300">{popupId}</span>
            </div>
            <div>
              <span className="text-white/50">Enabled:</span>
              <span className="ml-2">{enabled ? "✅" : "❌"}</span>
            </div>
            <div>
              <span className="text-white/50">Delay:</span>
              <span className="ml-2">{delayMs}ms</span>
            </div>
            <div>
              <span className="text-white/50">Open once:</span>
              <span className="ml-2">{openOnce ? "✅" : "❌"}</span>
            </div>
          </div>
        </div>

        <div
          ref={(ref: any) => drag(ref)}
          className="mb-3 cursor-grab select-none inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-200 text-xs"
        >
          PopupOfferComponent (Drag here)
          <button
            type="button"
            className="ml-2 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15"
            onClick={openModal}
          >
            Test Open Modal
          </button>
        </div>

        {/* Preview box - CHỈNH SỬA Ở ĐÂY */}
        <div
          className="relative bg-white text-black shadow-2xl"
          style={{ width: "100%", borderRadius: modalRadius }}
        >
          <div className="p-8">
            <Element
              id={`popup-offer-content-${popupId}`} 
              is={Container}
              canvas
              background="transparent"
              padding={0}
              margin={0}
              width="100%"
              height="auto"
              flexDirection="column"
              
              justifyContent="center"
              alignItems="center"
              gap={14}
              borderRadius={0}
              className="min-h-[160px]"
            >
              {/* Default children chỉ render lần đầu */}
              <HeadingComponent
                level="h2"
                text="UNLOCK 5% OFF"
                align="center"
                color="#000000"
              />
              <TextComponent
                fontSize={14}
                text="Edit me: description..."
                fontWeight="400"
                textAlign="center"
                color="rgba(0,0,0,.75)"
                lineHeight="1.4"
              />
              <ButtonComponent text="NO, THANKS" />
            </Element>
          </div>
        </div>

        {/* Hướng dẫn */}
        <div className="mt-3 space-y-2">
          <div className="text-xs text-zinc-400">
            💡 <strong>Để edit popup settings:</strong> Click vào khung xanh phía trên
          </div>
          <div className="text-xs text-zinc-400">
            ✏️ <strong>Để edit nội dung popup:</strong> Click vào text/button trong box trắng
          </div>
          <div className="text-xs text-green-400">
            ✅ <strong>Nội dung này sẽ hiện ở runtime modal!</strong>
          </div>
        </div>

        {/* Teaser preview */}
        {syncTeaserWithTitle && (
          <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-xs text-blue-300 font-semibold mb-1">
              Teaser Preview (synced with heading):
            </div>
            <div className="text-sm text-white font-bold">
              {actualTeaserText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

  // ============= 2) RUNTIME TEASER =============
  const RuntimeTeaser = () => {
    if (editorEnabled) return null;
    if (!teaserEnabled || !isTeaserOpen) return null;

    return (
      <div
        style={{
          position: "fixed",
          left: teaserOffsetX,
          bottom: teaserOffsetY,
          zIndex,
        }}
      >
        <div
          className="bg-white text-black shadow-xl border border-black/10"
          style={{ width: teaserWidth, borderRadius: 12, overflow: "hidden" }}
        >
          <div className="relative">
            <button
              className="absolute -top-0 -right-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow"
              type="button"
              onClick={() => setIsTeaserOpen(false)}
              aria-label="Close teaser"
            >
              <X size={14} />
            </button>

            <button
              className="w-full px-4 py-3 text-sm font-semibold tracking-wide"
              type="button"
              onClick={openModal}
            >
              {actualTeaserText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============= 3) RUNTIME MODAL =============
  const RuntimeModal = () => {
  if (editorEnabled) return null;
  if (!isModalOpen) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex }}
      className="flex items-center justify-center"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(0,0,0,${backdropOpacity})`,
        }}
        onClick={() => dismissOnOverlayClick && closeModalToTeaser()}
      />

      <div
        className="relative w-[92vw] max-w-full bg-white text-black shadow-2xl"
        style={{ width: modalWidth, borderRadius: modalRadius }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-3 top-3 p-2 rounded-full hover:bg-black/5 z-10"
          onClick={closeModalToTeaser}
          aria-label="Close modal"
          type="button"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          <div className="pointer-events-auto">
            <Element
              id={`popup-offer-content-${popupId}`} 
              is={Container}
              canvas
              background="transparent"
              padding={0}
              margin={0}
              width="100%"
              height="auto"
              flexDirection="column"
              justifyContent="flex-start"
              alignItems="stretch"
              gap={14}
              borderRadius={0}
              className="min-h-[160px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div ref={(ref: any) => connect(ref)} className="relative">
      <EditorPreview />
      {/* <RuntimeTeaser /> */}
      <RuntimeModal />
    </div>
  );
};
/* =========================
   THÊM SETTINGS PANEL
========================= */
const PopupOfferSettings = () => {
  const {
    popupId,
    enabled,
    delayMs,
    storageKey,
    openOnce,
    teaserEnabled,
    teaserText,
    teaserWidth,
    teaserOffsetX,
    teaserOffsetY,
    modalWidth,
    modalRadius,
    backdropOpacity,
    dismissOnOverlayClick,
    zIndex,
    syncTeaserWithTitle,
    actions: { setProp },
  } = useNode((node) => ({
    popupId: node.data.props.popupId,
    enabled: node.data.props.enabled,
    delayMs: node.data.props.delayMs,
    storageKey: node.data.props.storageKey,
    openOnce: node.data.props.openOnce,
    teaserEnabled: node.data.props.teaserEnabled,
    teaserText: node.data.props.teaserText,
    teaserWidth: node.data.props.teaserWidth,
    teaserOffsetX: node.data.props.teaserOffsetX,
    teaserOffsetY: node.data.props.teaserOffsetY,
    modalWidth: node.data.props.modalWidth,
    modalRadius: node.data.props.modalRadius,
    backdropOpacity: node.data.props.backdropOpacity,
    dismissOnOverlayClick: node.data.props.dismissOnOverlayClick,
    zIndex: node.data.props.zIndex,
    syncTeaserWithTitle: node.data.props.syncTeaserWithTitle,
  }));

  return (
    <div className="space-y-4 p-4">
      {/* POPUP ID - QUAN TRỌNG NHẤT */}
      <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/40">
        <label className="text-xs font-bold text-yellow-300 mb-2 block">
          🔑 POPUP ID (Quan trọng!)
        </label>
        <input
          type="text"
          className="w-full bg-zinc-800 border border-white/20 rounded px-3 py-2 text-white text-sm font-mono"
          value={popupId || ""}
          onChange={(e) => setProp((p: any) => (p.popupId = e.target.value))}
          placeholder="popup_signup"
        />
        <div className="text-[10px] text-yellow-200 mt-1">
          Button sẽ dùng ID này để mở popup
        </div>
      </div>

      {/* ENABLED */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          className="accent-purple-500"
          onChange={(e) =>
            setProp((p: any) => (p.enabled = e.target.checked))
          }
        />
        <label className="text-xs text-zinc-300">Enable Popup</label>
      </div>

      {/* DELAY */}
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">
          Auto-open delay (ms)
        </label>
        <input
          type="number"
          className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white text-sm"
          value={delayMs}
          onChange={(e) =>
            setProp((p: any) => (p.delayMs = parseInt(e.target.value) || 0))
          }
        />
      </div>

      {/* OPEN ONCE */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={openOnce}
          className="accent-purple-500"
          onChange={(e) =>
            setProp((p: any) => (p.openOnce = e.target.checked))
          }
        />
        <label className="text-xs text-zinc-300">
          Open once per session
        </label>
      </div>

      {/* STORAGE KEY */}
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">
          Storage Key
        </label>
        <input
          type="text"
          className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white text-sm"
          value={storageKey}
          onChange={(e) =>
            setProp((p: any) => (p.storageKey = e.target.value))
          }
        />
      </div>

      {/* TEASER */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={teaserEnabled}
            className="accent-purple-500"
            onChange={(e) =>
              setProp((p: any) => (p.teaserEnabled = e.target.checked))
            }
          />
          <label className="text-xs text-zinc-300 font-semibold">
            Enable Teaser
          </label>
        </div>

        {teaserEnabled && (
          <div className="space-y-3 pl-4 border-l-2 border-purple-500/30">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncTeaserWithTitle}
                className="accent-purple-500"
                onChange={(e) =>
                  setProp((p: any) => (p.syncTeaserWithTitle = e.target.checked))
                }
              />
              <label className="text-xs text-zinc-300">
                Sync with heading
              </label>
            </div>

            {!syncTeaserWithTitle && (
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">
                  Teaser Text
                </label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white text-sm"
                  value={teaserText}
                  onChange={(e) =>
                    setProp((p: any) => (p.teaserText = e.target.value))
                  }
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">
                  Width
                </label>
                <input
                  type="number"
                  className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white text-sm"
                  value={teaserWidth}
                  onChange={(e) =>
                    setProp((p: any) => (p.teaserWidth = parseInt(e.target.value)))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">
                  Offset X
                </label>
                <input
                  type="number"
                  className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white text-sm"
                  value={teaserOffsetX}
                  onChange={(e) =>
                    setProp((p: any) => (p.teaserOffsetX = parseInt(e.target.value)))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">
                  Offset Y
                </label>
                <input
                  type="number"
                  className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white text-sm"
                  value={teaserOffsetY}
                  onChange={(e) =>
                    setProp((p: any) => (p.teaserOffsetY = parseInt(e.target.value)))
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL STYLE */}
      <div className="border-t border-white/10 pt-4">
        <label className="text-xs text-zinc-300 font-semibold mb-3 block">
          Modal Style
        </label>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">
                Width
              </label>
              <input
                type="number"
                className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white text-sm"
                value={modalWidth}
                onChange={(e) =>
                  setProp((p: any) => (p.modalWidth = parseInt(e.target.value)))
                }
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">
                Radius
              </label>
              <input
                type="number"
                className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white text-sm"
                value={modalRadius}
                onChange={(e) =>
                  setProp((p: any) => (p.modalRadius = parseInt(e.target.value)))
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500 mb-1 block">
              Backdrop Opacity ({backdropOpacity})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              className="w-full"
              value={backdropOpacity}
              onChange={(e) =>
                setProp((p: any) => (p.backdropOpacity = parseFloat(e.target.value)))
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dismissOnOverlayClick}
              className="accent-purple-500"
              onChange={(e) =>
                setProp((p: any) => (p.dismissOnOverlayClick = e.target.checked))
              }
            />
            <label className="text-xs text-zinc-300">
              Close on overlay click
            </label>
          </div>

          <div>
            <label className="text-xs text-zinc-500 mb-1 block">
              Z-Index
            </label>
            <input
              type="number"
              className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white text-sm"
              value={zIndex}
              onChange={(e) =>
                setProp((p: any) => (p.zIndex = parseInt(e.target.value)))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

PopupOfferComponent.craft = {
  displayName: "Popup Offer",
  props: {
    enabled: true,
    popupId: "popup_1",
    delayMs: 5000,
    storageKey: "promo_popup_seen_v2",
    openOnce: true,
    teaserEnabled: true,
    teaserText: "GET DISCOUNT!",
    teaserWidth: 260,
    teaserOffsetX: 18,
    teaserOffsetY: 18,
    modalWidth: 560,
    modalRadius: 16,
    backdropOpacity: 0.55,
    dismissOnOverlayClick: true,
    zIndex: 80,
    showEditorPreview: true,
    syncTeaserWithTitle: true,
  },
  related: {
    settings: PopupOfferSettings,  // ✅ THÊM DÒNG NÀY
  },
  rules: {
    canDrag: () => true,
  },
};