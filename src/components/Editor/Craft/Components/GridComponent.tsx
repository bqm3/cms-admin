/* eslint-disable prettier/prettier */
import React from "react";
import { useNode } from "@craftjs/core";

export interface GridProps {
  columns: number;     // default columns
  gap: number;         // px
  minItemWidth: number; // px (auto responsive)
  align: "start" | "center" | "end" | "stretch";
  className?: string;
  children?: React.ReactNode;
}

export const GridComponent = ({
  columns = 3,
  gap = 16,
  minItemWidth = 260,
  align = "stretch",
  className = "",
  children,
}: GridProps) => {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className={className}
      style={{
         width: "100%",
    minHeight: 40,
    boxSizing: "border-box",
    display: "grid",
    gap,
    alignItems: align,
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    outline: selected ? "1px dashed rgba(255,255,255,.25)" : "none",
    outlineOffset: 4,
      }}
    >
      {children}
    </div>
  );
};

const GridSettings = () => {
  const { actions: { setProp }, columns, gap, minItemWidth, align } = useNode((node) => ({
    columns: node.data.props.columns,
    gap: node.data.props.gap,
    minItemWidth: node.data.props.minItemWidth,
    align: node.data.props.align,
  }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs opacity-70 mb-1">Columns</div>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={columns}
            onChange={(e) => setProp((p: any) => (p.columns = Number(e.target.value)))}
            min={1}
            max={12}
          />
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">Gap (px)</div>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={gap}
            onChange={(e) => setProp((p: any) => (p.gap = Number(e.target.value)))}
            min={0}
            max={80}
          />
        </div>
      </div>

      <div>
        <div className="text-xs opacity-70 mb-1">Min item width (px)</div>
        <input
          type="number"
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={minItemWidth}
          onChange={(e) => setProp((p: any) => (p.minItemWidth = Number(e.target.value)))}
          min={120}
          max={1200}
        />
        <div className="text-[11px] opacity-60 mt-1">
          (Nếu muốn auto responsive theo min width, mình sẽ bật auto-fit cho bạn ở bản sau)
        </div>
      </div>

      <div>
        <div className="text-xs opacity-70 mb-1">Align items</div>
        <select
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={align}
          onChange={(e) => setProp((p: any) => (p.align = e.target.value))}
        >
          {["stretch", "start", "center", "end"].map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

(GridComponent as any).craft = {
  displayName: "Grid",
  props: {
    columns: 3,
    gap: 16,
    minItemWidth: 260,
    align: "stretch",
    className: "",
  },
  related: {
    settings: GridSettings,
  },
};
