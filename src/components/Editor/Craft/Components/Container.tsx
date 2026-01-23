/* eslint-disable jsx-a11y/label-has-associated-control */
import { useNode } from "@craftjs/core";
import { Input } from "@heroui/input";
import React from "react";

interface ContainerProps {
  background?: string;
  padding?: number;
  margin?: number;
  width?: string;
  height?: string;
  flexDirection?: "row" | "column";
  positioning?: "flow" | "absolute";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  gap?: number;
  borderRadius?: number;
  children?: React.ReactNode;
  className?: string;
}

export const Container = ({
  background = "#18181b",
  padding = 0,
  margin = 0,
  width = "100%",
  height = "auto",
  flexDirection = "column",
  positioning = "flow",
  justifyContent = "flex-start",
  alignItems = "flex-start",
  gap = 0,
  borderRadius = 0,
  children,
  className = "",
}: ContainerProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const isFree = positioning === "absolute";

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      className={`${positioning === 'absolute' ? 'relative' : 'relative'} min-h-[50px] ${selected ? "outline outline-2 outline-blue-500 outline-dashed" : "border border-transparent hover:border-white/10"} ${className}`}
      style={{
        background,
        padding: `${padding}px`,
        margin: `${margin}px`,
        width,
        height,

        // flow => flex, free => block (children tự absolute)
        display: isFree ? "block" : "flex",
        flexDirection: isFree ? undefined : flexDirection,
        justifyContent: isFree ? undefined : justifyContent,
        alignItems: isFree ? undefined : alignItems,
        gap: isFree ? undefined : `${gap}px`,

        borderRadius: `${borderRadius}px`,

        // luôn relative để con absolute bám vào container
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
};

export const ContainerSettings = () => {
  const {
    background,
    padding,
    margin,
    flexDirection,
    positioning,
    justifyContent,
    alignItems,
    gap,
    borderRadius,
    actions: { setProp },
  } = useNode((node) => ({
    background: node.data.props.background,
    padding: node.data.props.padding,
    margin: node.data.props.margin,
    flexDirection: node.data.props.flexDirection,
    positioning: node.data.props.positioning,
    justifyContent: node.data.props.justifyContent,
    alignItems: node.data.props.alignItems,
    gap: node.data.props.gap,
    borderRadius: node.data.props.borderRadius,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 mb-2">Layout</h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-500">Mode</label>
            <div className="flex bg-zinc-800 rounded p-1 gap-1">
              <button
                className={`flex-1 p-1 text-xs rounded ${positioning === 'flow' ? 'bg-purple-600 text-white' : 'hover:bg-zinc-700'}`}
                onClick={() => setProp((props: any) => props.positioning = 'flow')}
              >Flow</button>
              <button
                className={`flex-1 p-1 text-xs rounded ${positioning === 'absolute' ? 'bg-purple-600 text-white' : 'hover:bg-zinc-700'}`}
                onClick={() => setProp((props: any) => props.positioning = 'absolute')}
              >Free</button>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500">Direction</label>
            <div className="flex bg-zinc-800 rounded p-1 gap-1">
              <button
                type="button"
                className={`flex-1 p-1 text-xs rounded ${
                  flexDirection === "row"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-zinc-700"
                }`}
                onClick={() => setProp((props: any) => (props.flexDirection = "row"))}
                disabled={positioning === "absolute"}
                title={positioning === "absolute" ? "Free mode không dùng flex direction" : ""}
              >
                Row
              </button>
              <button
                type="button"
                className={`flex-1 p-1 text-xs rounded ${
                  flexDirection === "column"
                    ? "bg-purple-600 text-white"
                    : "hover:bg-zinc-700"
                }`}
                onClick={() => setProp((props: any) => (props.flexDirection = "column"))}
                disabled={positioning === "absolute"}
                title={positioning === "absolute" ? "Free mode không dùng flex direction" : ""}
              >
                Col
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500">Gap</label>
            <Input
              type="number"
              size="sm"
              value={gap}
              onChange={(e) =>
                setProp((props: any) => (props.gap = parseInt(e.target.value || "0", 10)))
              }
              className="w-full"
              isDisabled={positioning === "absolute"}
            />
          </div>
        </div>

        <div className="mt-2">
          <label className="text-[10px] text-zinc-500">Align</label>
          <div className="flex bg-zinc-800 rounded p-1 gap-1 overflow-x-auto">
            {["flex-start", "center", "flex-end", "stretch"].map((val) => (
              <button
                key={val}
                type="button"
                className={`flex-1 p-1 text-[10px] rounded whitespace-nowrap ${
                  alignItems === val ? "bg-purple-600 text-white" : "hover:bg-zinc-700"
                }`}
                onClick={() => setProp((props: any) => (props.alignItems = val))}
                disabled={positioning === "absolute"}
              >
                {val.replace("flex-", "")}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2">
          <label className="text-[10px] text-zinc-500">Justify</label>
          <div className="flex bg-zinc-800 rounded p-1 gap-1 overflow-x-auto">
            {["flex-start", "center", "flex-end", "space-between"].map((val) => (
              <button
                key={val}
                type="button"
                className={`flex-1 p-1 text-[10px] rounded whitespace-nowrap ${
                  justifyContent === val ? "bg-purple-600 text-white" : "hover:bg-zinc-700"
                }`}
                onClick={() => setProp((props: any) => (props.justifyContent = val))}
                disabled={positioning === "absolute"}
              >
                {val.replace("flex-", "").replace("space-", "")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <h4 className="text-xs font-semibold text-zinc-400 mb-2">Spacing</h4>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Padding"
            type="number"
            size="sm"
            variant="bordered"
            value={padding}
            onChange={(e) =>
              setProp((props: any) => (props.padding = parseInt(e.target.value || "0", 10)))
            }
          />
          <Input
            label="Margin"
            type="number"
            size="sm"
            variant="bordered"
            value={margin}
            onChange={(e) =>
              setProp((props: any) => (props.margin = parseInt(e.target.value || "0", 10)))
            }
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <h4 className="text-xs font-semibold text-zinc-400 mb-2">Appearance</h4>
        <Input
          label="Background"
          size="sm"
          variant="bordered"
          value={background}
          onChange={(e) => setProp((props: any) => (props.background = e.target.value))}
          className="mb-2"
        />
        <div className="flex gap-2 items-center">
          <div
            className="w-6 h-6 rounded border border-white/10"
            style={{ backgroundColor: background }}
          />
          <span className="text-xs text-zinc-500">Preview</span>
        </div>

        <div className="mt-2">
          <label className="text-[10px] text-zinc-500 block mb-1">
            Border Radius: {borderRadius}px
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={borderRadius}
            className="w-full accent-purple-500"
            onChange={(e) =>
              setProp((props: any) => (props.borderRadius = parseInt(e.target.value || "0", 10)))
            }
          />
        </div>
      </div>
    </div>
  );
};

Container.craft = {
  displayName: "Container",
  props: {
    background: "#18181b",
    padding: 20,
    margin: 0,
    positioning: "flow",
    width: "100%",
    height: "auto",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 0,
  },
  related: {
    settings: ContainerSettings,
  },
  rules: {
    canMoveIn: () => true,
  },
};
