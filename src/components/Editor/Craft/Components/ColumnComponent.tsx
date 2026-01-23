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
  background = "transparent",
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
        "min-h-[60px] border border-dashed",
        selected ? "border-indigo-400/70" : "border-white/10",
        className,
      ].join(" ")}
      style={{
        // ✅ quan trọng: dùng flexBasis để giữ đúng tỉ lệ trong Row
        flex: `0 0 ${widthPercent}%`,
        maxWidth: `${widthPercent}%`,
        padding,
        background,
        boxSizing: "border-box",
      }}
    >
      {children}
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
  // ✅ Column là vùng chứa: cho thả mọi component vào
  rules: {
    canMoveIn: () => true,
  },
};
