/* eslint-disable prettier/prettier */
import React from "react";
import { useNode } from "@craftjs/core";

export interface GridProps {
  columns: number;          // desktop columns (default)
  columnsMd?: number;       // tablet columns
  columnsSm?: number;       // mobile columns
  gap: number;              // px
  minItemWidth: number;     // px (auto responsive)
  align: "start" | "center" | "end" | "stretch";
  className?: string;
  children?: React.ReactNode;
}

export const GridComponent = ({
  columns = 3,
  columnsMd,
  columnsSm,
  gap = 16,
  minItemWidth = 260,
  align = "stretch",
  className = "",
  children,
}: GridProps) => {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  // Generate responsive grid classes
  const getResponsiveClasses = () => {
    const classes = [];

    // Mobile (default)
    const mobileCols = columnsSm || 1;
    classes.push(`grid-cols-${mobileCols}`);

    // Tablet
    if (columnsMd) {
      classes.push(`md:grid-cols-${columnsMd}`);
    }

    // Desktop
    classes.push(`lg:grid-cols-${columns}`);

    return classes.join(' ');
  };

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className={`grid ${getResponsiveClasses()} ${className}`}
      style={{
        width: "100%",
        minHeight: 40,
        boxSizing: "border-box",
        gap,
        alignItems: align,
        outline: selected ? "1px dashed rgba(255,255,255,.25)" : "none",
        outlineOffset: 4,
      }}
    >
      {children}
    </div>
  );
};

const GridSettings = () => {
  const { actions: { setProp }, columns, columnsMd, columnsSm, gap, minItemWidth, align } = useNode((node) => ({
    columns: node.data.props.columns,
    columnsMd: node.data.props.columnsMd,
    columnsSm: node.data.props.columnsSm,
    gap: node.data.props.gap,
    minItemWidth: node.data.props.minItemWidth,
    align: node.data.props.align,
  }));

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs opacity-70 mb-2 font-bold">Responsive Columns</div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="text-[10px] opacity-60 mb-1">Mobile</div>
            <input
              type="number"
              className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
              value={columnsSm || 1}
              onChange={(e) => setProp((p: any) => (p.columnsSm = Number(e.target.value)))}
              min={1}
              max={4}
            />
          </div>
          <div>
            <div className="text-[10px] opacity-60 mb-1">Tablet</div>
            <input
              type="number"
              className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
              value={columnsMd || 2}
              onChange={(e) => setProp((p: any) => (p.columnsMd = Number(e.target.value)))}
              min={1}
              max={6}
            />
          </div>
          <div>
            <div className="text-[10px] opacity-60 mb-1">Desktop</div>
            <input
              type="number"
              className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
              value={columns}
              onChange={(e) => setProp((p: any) => (p.columns = Number(e.target.value)))}
              min={1}
              max={12}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
};

(GridComponent as any).craft = {
  displayName: "Grid",
  props: {
    columns: 3,
    columnsMd: 2,
    columnsSm: 1,
    gap: 16,
    minItemWidth: 260,
    align: "stretch",
    className: "",
  },
  related: {
    settings: GridSettings,
  },
};
