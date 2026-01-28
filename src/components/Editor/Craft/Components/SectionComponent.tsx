/* eslint-disable react/jsx-sort-props */
/* eslint-disable prettier/prettier */
import React from "react";
import { useNode } from "@craftjs/core";

type Overlay = {
  enabled: boolean;
  color: string; // rgba(...)
};

export interface SectionProps {
  id?: string;
  maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  paddingY: number;
  paddingX: number;
  background: string; // color or transparent
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  overlay: Overlay;
  borderRadius: number;
  className?: string;
  children?: React.ReactNode;
}

const MAX_WIDTH_MAP: Record<SectionProps["maxWidth"], string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  full: "100%",
};

export const SectionComponent = ({
  id,
  maxWidth = "xl",
  paddingY = 56,
  paddingX = 24,
  background = "transparent",
  backgroundImage = "",
  backgroundPosition = "center",
  backgroundSize = "cover",
  backgroundRepeat = "no-repeat",
  overlay = { enabled: false, color: "rgba(0,0,0,.4)" },
  borderRadius = 0,
  className = "",
  children,
}: SectionProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const hasBgImage = !!backgroundImage?.trim();

  return (
    <section
      ref={(ref) => ref && connect(drag(ref))}
      id={id}
      className={className}
      style={{
        width: "100%",
        boxSizing: "border-box",
        minHeight: 40, // ✅ để dễ chọn / nhìn thấy
        position: "relative",
        paddingTop: paddingY,
        paddingBottom: paddingY,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        background: hasBgImage ? undefined : background,
        backgroundImage: hasBgImage ? `url(${backgroundImage})` : undefined,
        backgroundPosition,
        backgroundSize,
        backgroundRepeat,
        borderRadius,
        outline: selected ? "1px dashed rgba(255,255,255,.25)" : "none",
        outlineOffset: 4,
      }}
    >
      {overlay?.enabled && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: overlay.color,
            borderRadius,
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          maxWidth: MAX_WIDTH_MAP[maxWidth],
          marginLeft: "auto",
          marginRight: "auto",
          width: "100%",
        }}
      >
        {children}
      </div>
    </section>
  );
};

const SectionSettings = () => {
  const {
    actions: { setProp },
    maxWidth,
    paddingY,
    paddingX,
    background,
    backgroundImage,
    overlay,
    borderRadius,
    id,
  } = useNode((node) => ({
    id: node.data.props.id,
    maxWidth: node.data.props.maxWidth,
    paddingY: node.data.props.paddingY,
    paddingX: node.data.props.paddingX,
    background: node.data.props.background,
    backgroundImage: node.data.props.backgroundImage,
    overlay: node.data.props.overlay,
    borderRadius: node.data.props.borderRadius,
  }));

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs opacity-70 mb-1">Section ID (anchor)</div>
        <input
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={id || ""}
          onChange={(e) => setProp((p: any) => (p.id = e.target.value))}
          placeholder="e.g. pricing, faq"
        />
      </div>

      <div>
        <div className="text-xs opacity-70 mb-1">Max width</div>
        <select
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={maxWidth}
          onChange={(e) => setProp((p: any) => (p.maxWidth = e.target.value))}
        >
          {["sm", "md", "lg", "xl", "2xl", "full"].map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs opacity-70 mb-1">Padding Y</div>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={paddingY}
            onChange={(e) =>
              setProp((p: any) => (p.paddingY = Number(e.target.value)))
            }
          />
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">Padding X</div>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={paddingX}
            onChange={(e) =>
              setProp((p: any) => (p.paddingX = Number(e.target.value)))
            }
          />
        </div>
      </div>

      <div>
        <div className="text-xs opacity-70 mb-1">Background</div>
        <input
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={background}
          onChange={(e) => setProp((p: any) => (p.background = e.target.value))}
          placeholder="e.g. #070A0F or rgba(...)"
        />
      </div>

      <div>
        <div className="text-xs opacity-70 mb-1">Background image URL</div>
        <input
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={backgroundImage || ""}
          onChange={(e) =>
            setProp((p: any) => (p.backgroundImage = e.target.value))
          }
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs opacity-70 mb-1">Overlay</div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!overlay?.enabled}
              onChange={(e) =>
                setProp(
                  (p: any) =>
                    (p.overlay = {
                      ...(p.overlay || {}),
                      enabled: e.target.checked,
                    }),
                )
              }
            />
            Enabled
          </label>
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">Overlay color</div>
          <input
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={overlay?.color || "rgba(0,0,0,.4)"}
            onChange={(e) =>
              setProp(
                (p: any) =>
                  (p.overlay = { ...(p.overlay || {}), color: e.target.value }),
              )
            }
            placeholder="rgba(0,0,0,.4)"
          />
        </div>
      </div>

      <div>
        <div className="text-xs opacity-70 mb-1">Border radius</div>
        <input
          type="number"
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={borderRadius}
          onChange={(e) =>
            setProp((p: any) => (p.borderRadius = Number(e.target.value)))
          }
        />
      </div>
    </div>
  );
};

(SectionComponent as any).craft = {
  displayName: "Section",
  props: {
    id: "",
    maxWidth: "xl",
    paddingY: 56,
    paddingX: 24,
    background: "transparent",
    backgroundImage: "",
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    overlay: { enabled: false, color: "rgba(0,0,0,.4)" },
    borderRadius: 0,
    className: "",
  },
  related: {
    settings: SectionSettings,
  },
};
