/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-sort-props */
import React, { useEffect, useState } from "react";
import { Element, useNode } from "@craftjs/core";
import { X } from "lucide-react";

import { Container } from "./Container";
import { HeadingComponent } from "./HeadingComponent";
import { TextComponent } from "./TextComponent";
import { ButtonComponent } from "./ButtonComponent";
import { InputComponent } from "./InputComponent";
import { useEditorMode } from "../utils/useEditorMode";

type PopupModalProps = {
  enabled?: boolean;

  delayMs?: number; // 5000
  storageKey?: string; // localStorage key
  showOnce?: boolean; // đóng rồi thì không hiện lại
  dismissOnOverlayClick?: boolean;

  width?: number;
  radius?: number;
  backdropOpacity?: number; // 0..1
  zIndex?: number;

  // ✅ Editor mode luôn mở để bạn kéo thả content trong popup
  forceOpenInEditor?: boolean;
};

export const PopupModalComponent: React.FC<PopupModalProps> & { craft: any } = ({
  enabled = true,

  delayMs = 5000,
  storageKey = "promo_popup_dismissed_v1",
  showOnce = true,
  dismissOnOverlayClick = true,

  width = 520,
  radius = 16,
  backdropOpacity = 0.6,
  zIndex = 60,

  forceOpenInEditor = true,
}) => {
  const editorEnabled = useEditorMode(); // ✅ true=Editor mode
  const [open, setOpen] = useState(false);

  const dismissed = (() => {
    if (!showOnce) return false;
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (!enabled) return;

    // ✅ Editor mode: luôn mở để kéo thả chỉnh layout popup
    if (editorEnabled && forceOpenInEditor) {
      setOpen(true);
      return;
    }

    // ✅ Runtime/Preview: chỉ mở nếu chưa dismissed, và sau delay
    if (dismissed) return;

    const t = window.setTimeout(() => setOpen(true), Math.max(0, delayMs));
    return () => window.clearTimeout(t);
  }, [enabled, editorEnabled, forceOpenInEditor, dismissed, delayMs]);

  const close = () => {
    setOpen(false);
    if (showOnce) {
      try {
        localStorage.setItem(storageKey, "1"); // ✅ reload không hiện lại
      } catch {}
    }
  };

  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  if (!enabled) return null;
  if (!open) return null;

  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      style={{ zIndex }}
      className={[
        "fixed inset-0 flex items-center justify-center",
        selected ? "outline outline-2 outline-indigo-500/40" : "",
      ].join(" ")}
    >
      {/* overlay */}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0,0,0,${backdropOpacity})` }}
        onClick={() => dismissOnOverlayClick && close()}
      />

      {/* modal */}
      <div
        className="relative w-[92vw] max-w-full bg-white text-black shadow-2xl"
        style={{ width, borderRadius: radius }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-3 top-3 p-2 rounded-full hover:bg-black/5"
          onClick={close}
          aria-label="Close"
          type="button"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          <Element
            id="popup-content"
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
            {/* Default content giống mẫu (bạn kéo thả sửa lại được) */}
            <HeadingComponent level="h2" text="UNLOCK 5% OFF" align="center" color="#000000" />
            <TextComponent
              fontSize={14}
              text="Sign up to receive 5% off your first order and exclusive access to our best offers."
              fontWeight="400"
              textAlign="center"
              color="rgba(0,0,0,.75)"
              lineHeight="1.4"
            />
            <InputComponent placeholder="Email" type="email" />
            <ButtonComponent text="SIGN ME UP!" background="#000000" color="#ffffff" fullWidth radius="full" />
            <ButtonComponent text="NO, THANKS" background="transparent" color="rgba(0,0,0,.7)" fullWidth radius="none" />
          </Element>
        </div>
      </div>
    </div>
  );
};

PopupModalComponent.craft = {
  displayName: "Popup Modal",
  props: {
    enabled: true,
    delayMs: 5000,
    storageKey: "promo_popup_dismissed_v1",
    showOnce: true,
    dismissOnOverlayClick: true,
    width: 520,
    radius: 16,
    backdropOpacity: 0.6,
    zIndex: 60,
    forceOpenInEditor: true,
  },
};
