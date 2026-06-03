/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useMemo } from "react";
import { useEditor, useNode } from "@craftjs/core";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { openPopup } from "../utils/popupBus";
import { useEditorMode } from "../utils/useEditorMode";

const POPUP_OFFER_DISPLAY_NAME = "Popup Offer";
const BUTTON_DISPLAY_NAME = "Button";

function isInsidePopupOffer(query: any, nodeId: string) {
  let currentId = nodeId;

  while (currentId) {
    const currentNode = query.node(currentId).get();
    const parentId = currentNode?.data?.parent;
    if (!parentId) return false;

    const parentNode = query.node(parentId).get();
    if (!parentNode) return false;

    if (parentNode?.data?.displayName === POPUP_OFFER_DISPLAY_NAME) {
      return true;
    }

    currentId = parentId;
  }

  return false;
}

function findSharedPopupOfferHref(query: any, excludeNodeId?: string) {
  const state = query.getState();
  const nodes = state?.nodes || {};

  for (const [nodeId, node] of Object.entries(nodes as Record<string, any>)) {
    if (nodeId === excludeNodeId) continue;
    const nodeData = node as any;
    if (nodeData?.data?.displayName !== BUTTON_DISPLAY_NAME) continue;

    const props = nodeData?.data?.props || {};
    if ((props.action || "link") !== "link") continue;
    if (props.hrefOverride) continue;
    if (!isInsidePopupOffer(query, nodeId)) continue;

    const href = String(props.href || "").trim();
    if (href) return href;
  }

  return "";
}

function syncPopupOfferHref(query: any, actions: any, nextHref: string) {
  const state = query.getState();
  const nodes = state?.nodes || {};

  Object.entries(nodes as Record<string, any>).forEach(([nodeId, node]) => {
    const nodeData = node as any;
    if (nodeData?.data?.displayName !== BUTTON_DISPLAY_NAME) return;

    const props = nodeData?.data?.props || {};
    if ((props.action || "link") !== "link") return;
    if (props.hrefOverride) return;
    if (!isInsidePopupOffer(query, nodeId)) return;

    actions.setProp(nodeId, (p: any) => {
      p.href = nextHref;
    });
  });
}

/* =========================
   Button Component
========================= */
export const ButtonComponent = ({
  text,
  color,
  variant,
  size,
  radius,
  fullWidth,
  href,
  openInNewTab,
  action = "link",
  popupId = "",
  hrefOverride = false,
}: any) => {
  const editorEnabled = useEditorMode();
  const { query, actions: editorActions } = useEditor();

  const {
    connectors: { connect, drag },
    selected,
    id: nodeId,
    actions: { setProp },
  } = useNode((node) => ({
    id: node.id,
    selected: node.events.selected,
  }));

  const isPopupOfferChild = useMemo(() => {
    try {
      return isInsidePopupOffer(query, nodeId);
    } catch {
      return false;
    }
  }, [query, nodeId]);

  useEffect(() => {
    if (!editorEnabled) return;
    if (action !== "link") return;
    if (hrefOverride) return;
    if (!isPopupOfferChild) return;
    if (String(href || "").trim()) return;

    const sharedHref = findSharedPopupOfferHref(query, nodeId);
    if (!sharedHref) return;

    setProp((p: any) => {
      p.href = sharedHref;
    });
  }, [editorEnabled, action, hrefOverride, isPopupOfferChild, href, nodeId, query, setProp]);

  const handleClick = (e: React.MouseEvent) => {
    if (editorEnabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (action === "openPopup") {
      e.preventDefault();
      e.stopPropagation();
      if (popupId) openPopup(popupId);
    }
  };

  const isPopup = action === "openPopup";

  const buttonEl = (
    <Button
      className={selected ? "ring-2 ring-blue-500" : ""}
      color={color}
      fullWidth={fullWidth}
      radius={radius}
      size={size}
      variant={variant}
      onPress={() => {}}
      onClick={handleClick}
    >
      {text}
    </Button>
  );

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="inline-block m-1"
      style={{ width: fullWidth ? "100%" : "auto" }}
    >
      {!isPopup && href ? (
        <a
          href={href}
          className="inline-block"
          target={openInNewTab ? "_blank" : "_self"}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          onClick={handleClick}
          onMouseDown={(e) => editorEnabled && e.preventDefault()}
        >
          {buttonEl}
        </a>
      ) : (
        buttonEl
      )}
    </div>
  );
};

/* =========================
   Settings Panel
========================= */
export const ButtonSettings = () => {
  const { query, actions: editorActions } = useEditor();

  const {
    id: nodeId,
    text,
    color,
    variant,
    size,
    fullWidth,
    href,
    openInNewTab,
    action,
    popupId,
    hrefOverride,
    actions: { setProp },
  } = useNode((node) => ({
    id: node.id,
    text: node.data.props.text,
    color: node.data.props.color,
    variant: node.data.props.variant,
    size: node.data.props.size,
    radius: node.data.props.radius,
    fullWidth: node.data.props.fullWidth,
    href: node.data.props.href,
    openInNewTab: node.data.props.openInNewTab,
    action: node.data.props.action,
    popupId: node.data.props.popupId,
    hrefOverride: node.data.props.hrefOverride,
  }));

  const isPopupOfferChild = useMemo(() => {
    try {
      return isInsidePopupOffer(query, nodeId);
    } catch {
      return false;
    }
  }, [query, nodeId]);

  const handleHrefChange = (nextHref: string) => {
    if (isPopupOfferChild && !hrefOverride) {
      syncPopupOfferHref(query, editorActions, nextHref);
      return;
    }

    setProp((p: any) => {
      p.href = nextHref;
    });
  };

  const handleEnableOverride = () => {
    const sharedHref = findSharedPopupOfferHref(query, nodeId);
    setProp((p: any) => {
      p.hrefOverride = true;
      if (!String(p.href || "").trim() && sharedHref) {
        p.href = sharedHref;
      }
    });
  };

  const handleUseDefault = () => {
    const sharedHref = findSharedPopupOfferHref(query, nodeId);
    setProp((p: any) => {
      p.hrefOverride = false;
      if (sharedHref) {
        p.href = sharedHref;
      }
    });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Label"
        size="sm"
        value={text}
        variant="bordered"
        onChange={(e) => setProp((p: any) => (p.text = e.target.value))}
      />

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Action</label>
        <select
          className="w-full bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
          value={action}
          onChange={(e) => setProp((p: any) => (p.action = e.target.value))}
        >
          <option value="link">Open link</option>
          <option value="openPopup">Open popup</option>
        </select>
      </div>

      {action === "openPopup" && (
        <Input
          label="Popup ID"
          placeholder="popup_signup"
          size="sm"
          value={popupId || ""}
          variant="bordered"
          onChange={(e) => setProp((p: any) => (p.popupId = e.target.value))}
        />
      )}

      {action === "link" && (
        <>
          {isPopupOfferChild && (
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-200">
              <div className="font-semibold text-sky-100">Popup Offer link mặc định</div>
              <div className="mt-1 text-sky-200/80">
                Khi chưa ghi đè, thay đổi URL sẽ được áp dụng cho tất cả Button Link mặc định bên trong Popup Offer.
              </div>
              <div className="mt-2">
                {hrefOverride ? (
                  <button
                    type="button"
                    className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 font-semibold text-sky-100 hover:bg-sky-400/20"
                    onClick={handleUseDefault}
                  >
                    Dùng mặc định
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 font-semibold text-sky-100 hover:bg-sky-400/20"
                    onClick={handleEnableOverride}
                  >
                    Ghi đè
                  </button>
                )}
              </div>
            </div>
          )}

          <Input
            label="Link (URL)"
            placeholder="https://example.com"
            size="sm"
            value={href || ""}
            variant="bordered"
            onChange={(e) => handleHrefChange(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={openInNewTab}
              className="accent-purple-500"
              onChange={(e) => setProp((p: any) => (p.openInNewTab = e.target.checked))}
            />
            <label className="text-xs text-zinc-400">Open in new tab</label>
          </div>
        </>
      )}

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Style</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
            value={color}
            onChange={(e) => setProp((p: any) => (p.color = e.target.value))}
          >
            {["default", "primary", "secondary", "success", "warning", "danger"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
            value={variant}
            onChange={(e) => setProp((p: any) => (p.variant = e.target.value))}
          >
            {["bordered", "light", "flat", "faded", "shadow", "ghost"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        {["sm", "md", "lg"].map((s) => (
          <button
            key={s}
            className={`flex-1 rounded p-2 text-xs ${size === s ? "bg-purple-600 text-white" : "bg-zinc-800"}`}
            onClick={() => setProp((p: any) => (p.size = s))}
            type="button"
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={fullWidth}
          className="accent-purple-500"
          onChange={(e) => setProp((p: any) => (p.fullWidth = e.target.checked))}
        />
        <label className="text-xs text-zinc-400">Full width</label>
      </div>
    </div>
  );
};

/* =========================
   Craft Config
========================= */
ButtonComponent.craft = {
  displayName: "Button",
  props: {
    text: "Click Me",
    color: "primary",
    variant: "bordered",
    size: "md",
    radius: "md",
    fullWidth: false,
    action: "link",
    popupId: "",
    href: "",
    hrefOverride: false,
    openInNewTab: true,
  },
  related: {
    settings: ButtonSettings,
  },
};
