/* eslint-disable prettier/prettier */
import React from "react";
import { useNode } from "@craftjs/core";

export interface BadgeProps {
  text: string;
  variant: "solid" | "soft" | "outline";
  color: "default" | "success" | "warning" | "primary" | "danger";
  radius: "sm" | "md" | "full";
  size: "sm" | "md";
}

const COLOR_MAP: Record<BadgeProps["color"], { bg: string; fg: string; bd: string; softBg: string }> = {
  default: { bg: "rgba(255,255,255,.12)", softBg: "rgba(255,255,255,.08)", fg: "#fff", bd: "rgba(255,255,255,.14)" },
  primary: { bg: "rgba(99,102,241,.9)", softBg: "rgba(99,102,241,.18)", fg: "#fff", bd: "rgba(99,102,241,.35)" },
  success: { bg: "rgba(16,185,129,.9)", softBg: "rgba(16,185,129,.18)", fg: "#fff", bd: "rgba(16,185,129,.35)" },
  warning: { bg: "rgba(245,158,11,.9)", softBg: "rgba(245,158,11,.18)", fg: "#fff", bd: "rgba(245,158,11,.35)" },
  danger: { bg: "rgba(239,68,68,.9)", softBg: "rgba(239,68,68,.18)", fg: "#fff", bd: "rgba(239,68,68,.35)" },
};

const RADIUS_MAP: Record<BadgeProps["radius"], number> = { sm: 8, md: 12, full: 999 };
const SIZE_MAP: Record<BadgeProps["size"], { px: number; py: number; fs: number }> = {
  sm: { px: 10, py: 5, fs: 12 },
  md: { px: 12, py: 7, fs: 13 },
};

export const BadgeComponent = ({
  text = "Verified",
  variant = "soft",
  color = "success",
  radius = "full",
  size = "sm",
}: BadgeProps) => {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const c = COLOR_MAP[color];
  const s = SIZE_MAP[size];

  const style: React.CSSProperties =
    variant === "solid"
      ? { background: c.bg, color: c.fg, border: "1px solid transparent" }
      : variant === "outline"
      ? { background: "transparent", color: c.fg, border: `1px solid ${c.bd}` }
      : { background: c.softBg, color: c.fg, border: `1px solid ${c.bd}` };

  return (
    <span
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: s.px,
        paddingRight: s.px,
        paddingTop: s.py,
        paddingBottom: s.py,
        borderRadius: RADIUS_MAP[radius],
        fontSize: s.fs,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...style,
        outline: selected ? "1px dashed rgba(255,255,255,.25)" : "none",
        outlineOffset: 3,
      }}
    >
      {text}
    </span>
  );
};

const BadgeSettings = () => {
  const { actions: { setProp }, text, variant, color, radius, size } = useNode((node) => ({
    text: node.data.props.text,
    variant: node.data.props.variant,
    color: node.data.props.color,
    radius: node.data.props.radius,
    size: node.data.props.size,
  }));

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs opacity-70 mb-1">Text</div>
        <input
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={text}
          onChange={(e) => setProp((p: any) => (p.text = e.target.value))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs opacity-70 mb-1">Variant</div>
          <select
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={variant}
            onChange={(e) => setProp((p: any) => (p.variant = e.target.value))}
          >
            {["soft", "solid", "outline"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs opacity-70 mb-1">Color</div>
          <select
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={color}
            onChange={(e) => setProp((p: any) => (p.color = e.target.value))}
          >
            {["default", "primary", "success", "warning", "danger"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs opacity-70 mb-1">Radius</div>
          <select
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={radius}
            onChange={(e) => setProp((p: any) => (p.radius = e.target.value))}
          >
            {["sm", "md", "full"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs opacity-70 mb-1">Size</div>
          <select
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={size}
            onChange={(e) => setProp((p: any) => (p.size = e.target.value))}
          >
            {["sm", "md"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

(BadgeComponent as any).craft = {
  displayName: "Badge",
  props: {
    text: "Verified",
    variant: "soft",
    color: "success",
    radius: "full",
    size: "sm",
  },
  related: {
    settings: BadgeSettings,
  },
};
