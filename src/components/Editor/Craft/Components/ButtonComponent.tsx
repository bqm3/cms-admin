/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import { useEditor, useNode } from "@craftjs/core";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { openPopup } from "../utils/popupBus";

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
  action = "link",   // link | openPopup
  popupId = "",
}: any) => {
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const handleClick = (e: React.MouseEvent) => {
    // 👉 Editor mode: không cho action thật
    if (enabled) {
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
      {/* 👉 Popup thì KHÔNG render <a> */}
      {!isPopup && href ? (
        <a
          href={href}
          className="inline-block"
          target={openInNewTab ? "_blank" : "_self"}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          onClick={handleClick}
          onMouseDown={(e) => enabled && e.preventDefault()}
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
  const {
    text,
    color,
    variant,
    size,
    radius,
    fullWidth,
    href,
    openInNewTab,
    action,
    popupId,
    actions: { setProp },
  } = useNode((node) => ({
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
  }));

  return (
    <div className="space-y-4">
      {/* TEXT */}
      <Input
        label="Label"
        size="sm"
        value={text}
        variant="bordered"
        onChange={(e) =>
          setProp((p: any) => (p.text = e.target.value))
        }
      />

      {/* ACTION */}
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Action</label>
        <select
          className="w-full bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
          value={action}
          onChange={(e) =>
            setProp((p: any) => (p.action = e.target.value))
          }
        >
          <option value="link">Open link</option>
          <option value="openPopup">Open popup</option>
        </select>
      </div>

      {/* POPUP ID */}
      {action === "openPopup" && (
        <Input
          label="Popup ID"
          placeholder="popup_signup"
          size="sm"
          value={popupId || ""}
          variant="bordered"
          onChange={(e) =>
            setProp((p: any) => (p.popupId = e.target.value))
          }
        />
      )}

      {/* LINK */}
      {action === "link" && (
        <>
          <Input
            label="Link (URL)"
            placeholder="https://example.com"
            size="sm"
            value={href || ""}
            variant="bordered"
            onChange={(e) =>
              setProp((p: any) => (p.href = e.target.value))
            }
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={openInNewTab}
              className="accent-purple-500"
              onChange={(e) =>
                setProp((p: any) => (p.openInNewTab = e.target.checked))
              }
            />
            <label className="text-xs text-zinc-400">
              Open in new tab
            </label>
          </div>
        </>
      )}

      {/* STYLE */}
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Style</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
            value={color}
            onChange={(e) =>
              setProp((p: any) => (p.color = e.target.value))
            }
          >
            {["default", "primary", "secondary", "success", "warning", "danger"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
            value={variant}
            onChange={(e) =>
              setProp((p: any) => (p.variant = e.target.value))
            }
          >
            {["bordered", "light", "flat", "faded", "shadow", "ghost"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SIZE */}
      <div className="flex gap-2">
        {["sm", "md", "lg"].map((s) => (
          <button
            key={s}
            className={`flex-1 p-2 text-xs rounded ${
              size === s ? "bg-purple-600 text-white" : "bg-zinc-800"
            }`}
            onClick={() => setProp((p: any) => (p.size = s))}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* FULL WIDTH */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={fullWidth}
          className="accent-purple-500"
          onChange={(e) =>
            setProp((p: any) => (p.fullWidth = e.target.checked))
          }
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
    openInNewTab: true,
  },
  related: {
    settings: ButtonSettings,
  },
};
