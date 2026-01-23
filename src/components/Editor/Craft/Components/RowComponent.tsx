import { useNode } from "@craftjs/core";
import clsx from "clsx";
import { ColumnComponent } from "./ColumnComponent";

import React from "react";

type RowProps = {
  gap?: number;
  padding?: number;
  background?: string;
  justifyContent?: React.CSSProperties["justifyContent"];
  alignItems?: React.CSSProperties["alignItems"];
  wrap?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export const RowComponent: React.FC<RowProps> & {
  craft?: any;
} = ({
  gap = 12,
  padding = 10,
  background = "transparent",
  justifyContent = "flex-start",
  alignItems = "stretch",
  wrap = false,
  className = "",
  children,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      className={[
        "w-full min-h-[60px] border border-dashed",
        selected ? "border-indigo-400/70" : "border-white/10",
        className,
      ].join(" ")}
      style={{
        display: "flex",
        flexDirection: "row",
        gap,
        padding,
        background,
        justifyContent,
        alignItems,
        flexWrap: wrap ? "wrap" : "nowrap",
      }}
    >
      {children}
    </div>
  );
};

RowComponent.craft = {
  displayName: "Row",
  props: {
    gap: 12,
    padding: 10,
    background: "transparent",
    justifyContent: "flex-start",
    alignItems: "stretch",
    wrap: false,
  },
  // ✅ chỉ cho thả Column vào Row (optional nhưng rất nên)
  rules: {
    canMoveIn: (incomingNodes: any[]) =>
      incomingNodes.every((n) => n.data?.displayName === "Column"),
  },
};

