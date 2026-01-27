import React from "react";
import { useNode } from "@craftjs/core";

type ColumnProps = {
  span?: number; // 1..12
  padding?: number;
  background?: string;
  className?: string;
  children?: React.ReactNode;
};

type ComponentWithCraft = React.FC<ColumnProps> & {
  craft: any;
};

export const ColumnComponent: ComponentWithCraft = ({
  span = 6,
  padding = 10,
  background = "#ffffff", // ✅ mặc định trắng
  className = "",
  children,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const s = Math.max(1, Math.min(12, span));
  const widthPercent = (s / 12) * 100;

  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      className={[
        "min-h-[60px]",
        "border border-dashed",
        selected ? "border-indigo-400/70" : "border-white/10",
        className,
      ].join(" ")}
      style={{
        flex: `0 0 ${widthPercent}%`,
        maxWidth: `${widthPercent}%`,
        padding,
        backgroundColor: background || "#ffffff", // ✅ fallback an toàn
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
};

export const ColumnSettings = () => {
  const {
    background,
    padding,
    span,
    actions: { setProp },
  } = useNode((node) => ({
    background: node.data.props.background,
    padding: node.data.props.padding,
    span: node.data.props.span,
  }));

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-zinc-400">Span (1–12)</label>
        <input
          type="number"
          min={1}
          max={12}
          value={span}
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
          onChange={(e) =>
            setProp((p: any) => (p.span = Number(e.target.value) || 6))
          }
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400">Padding</label>
        <input
          type="number"
          value={padding}
          className="w-full bg-zinc-800 text-white text-xs p-2 rounded"
          onChange={(e) =>
            setProp((p: any) => (p.padding = Number(e.target.value) || 0))
          }
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400">Background</label>
        <input
          type="color"
          value={background === "transparent" ? "#ffffff" : background}
          className="w-full h-8 rounded"
          onChange={(e) =>
            setProp((p: any) => (p.background = e.target.value))
          }
        />
      </div>

      <button
        className="text-xs px-2 py-1 bg-white/10 rounded"
        onClick={() =>
          setProp((p: any) => (p.background = "transparent"))
        }
      >
        Clear background
      </button>
    </div>
  );
};


ColumnComponent.craft = {
  displayName: "Column",
  props: {
    span: 6,
    padding: 10,
    background: "transparent",
  },
  related: {
    settings: ColumnSettings,
  },
  rules: {
    canMoveIn: () => true,
  },
};

