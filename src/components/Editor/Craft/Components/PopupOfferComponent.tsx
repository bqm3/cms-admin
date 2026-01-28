/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-sort-props */
import React, { useEffect, useMemo, useState } from "react";
import { Element, useNode, useEditor } from "@craftjs/core";
import { X } from "lucide-react";

import { Container } from "./Container";
import { useEditorMode } from "../utils/useEditorMode";

import { HeadingComponent } from "./HeadingComponent";
import { TextComponent } from "./TextComponent";
import { ButtonComponent } from "./ButtonComponent";
import { InputComponent } from "./InputComponent";

type PopupOfferComponentProps = {
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

  const seen = useMemo(() => {
    if (!openOnce) return false;
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  }, [openOnce, storageKey]);

  const markSeen = () => {
    if (!openOnce) return;
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
  };

  useEffect(() => {
    if (!enabled) return;

    if (editorEnabled) {
      setIsModalOpen(false);
      setIsTeaserOpen(true);
      return;
    }

    if (seen) {
      setIsModalOpen(false);
      setIsTeaserOpen(true);
      return;
    }

    const t = window.setTimeout(
      () => {
        setIsModalOpen(true);
        setIsTeaserOpen(false);
        markSeen();
      },
      Math.max(0, delayMs),
    );

    return () => window.clearTimeout(t);
  }, [enabled, editorEnabled, seen, delayMs]);

  const openModal = () => {
    setIsModalOpen(true);
    setIsTeaserOpen(false);
    markSeen();
  };

  const closeModalToTeaser = () => {
    setIsModalOpen(false);
    setIsTeaserOpen(true);
    markSeen();
  };

  if (!enabled) return null;

  // ============= 1) EDITOR PREVIEW =============
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
              Open Runtime Modal
            </button>
          </div>

          <div
            className="relative bg-white text-black shadow-2xl"
            style={{ width: "100%", borderRadius: modalRadius }}
          >
            <div className="p-8">
              <Element
                id="popup-offer-content"
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
              >
                {/* Default children */}
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
                <InputComponent placeholder="Email" type="email" />
                <ButtonComponent text="SIGN ME UP!" />
                <ButtonComponent text="NO, THANKS" />
              </Element>
            </div>
          </div>

          <div className="mt-3 text-xs text-zinc-400">
            Tip: click từng text/button bên trong box trắng để select & edit.
          </div>
        </div>

        {/* ✅ Preview teaser synced */}
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
                id="popup-offer-content"
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
      <RuntimeTeaser />
      <RuntimeModal />
    </div>
  );
};

PopupOfferComponent.craft = {
  displayName: "Popup Offer",
  props: {
    enabled: true,
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
  rules: {
    canDrag: () => true,
  },
};