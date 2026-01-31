/* eslint-disable jsx-a11y/label-has-associated-control */
import { useNode } from "@craftjs/core";
import { Input } from "@heroui/input";
import React from "react";
import { useEditorMode } from "../utils/useEditorMode";

type DisplayMode = "auto" | "flex" | "grid" | "block";
type BorderStyle = "none" | "solid" | "dashed" | "dotted";

interface ContainerProps {
  background?: string;
  padding?: number;
  margin?: number;
  width?: string;
  height?: string;

  displayMode?: DisplayMode;

  flexDirection?: "row" | "column";
  positioning?: "flow" | "absolute";
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  gap?: number;

  borderRadius?: number;

  borderWidth?: number;      // ✅ new
  borderStyle?: BorderStyle; // ✅ new
  borderColor?: string;      // ✅ new

  children?: React.ReactNode;
  className?: string;
}

const resolveDisplay = (
  displayMode: DisplayMode,
  positioning: "flow" | "absolute",
  className: string,
) => {
  if (displayMode !== "auto") return displayMode;

  // auto mode: nếu className có grid => grid wins
  const hasGrid = /\bgrid\b/.test(className);

  if (hasGrid) return "grid";
  if (positioning === "absolute") return "block";
  return "flex";
};

export const Container = ({
  background = "#fff",
  padding = 0,
  margin = 0,
  width = "100%",
  height = "auto",

  displayMode = "auto",

  flexDirection = "column",
  positioning = "flow",
  justifyContent = "flex-start",
  alignItems = "flex-start",
  gap = 10,

  borderRadius = 0,

  borderWidth = 0,
  borderStyle = "solid",
  borderColor = "rgba(255,255,255,.10)",

  children,
  className = "",
}: ContainerProps) => {
  const {
    connectors: { connect, drag },
    hovered,
    selected,
  } = useNode((state) => ({
    hovered: state.events.hovered,
    selected: state.events.selected,
  }));

  const enabled = useEditorMode();
  const showOutline = enabled && (hovered || selected);

  const display = resolveDisplay(displayMode, positioning, className);
  const isFlex = display === "flex";
  const isFree = positioning === "absolute";

  const computedBorder =
    borderWidth > 0 && borderStyle !== "none"
      ? `${borderWidth}px ${borderStyle} ${borderColor}`
      : undefined;

  return (
    <div
      ref={(ref) => {
  if (!ref) return;
  if (enabled) connect(drag(ref));
  else connect(ref);
}}
      className={[
        "relative min-h-[50px]",
        showOutline ? "outline outline-1 outline-dashed outline-zinc-500/70" : "",
        className,
      ].join(" ")}
      style={{
        background,
        padding: `${padding}px`,
        margin: `${margin}px`,
        width,
        height,

        // ✅ display no longer always flex
        display,

        // ✅ only apply flex props when display === flex
        flexDirection: isFlex && !isFree ? flexDirection : undefined,
        justifyContent: isFlex && !isFree ? justifyContent : undefined,
        alignItems: isFlex && !isFree ? alignItems : undefined,
        gap: isFlex && !isFree ? `${gap}px` : undefined,

        borderRadius: `${borderRadius}px`,
        border: computedBorder,

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
    width,
    height,
    displayMode,

    flexDirection,
    positioning,
    justifyContent,
    alignItems,
    gap,
    borderRadius,

    borderWidth,
    borderStyle,
    borderColor,

    actions: { setProp },
  } = useNode((node) => ({
    background: node.data.props.background,
    padding: node.data.props.padding,
    margin: node.data.props.margin,
    width: node.data.props.width,
    height: node.data.props.height,

    displayMode: node.data.props.displayMode,

    flexDirection: node.data.props.flexDirection,
    positioning: node.data.props.positioning,
    justifyContent: node.data.props.justifyContent,
    alignItems: node.data.props.alignItems,
    gap: node.data.props.gap,
    borderRadius: node.data.props.borderRadius,

    borderWidth: node.data.props.borderWidth,
    borderStyle: node.data.props.borderStyle,
    borderColor: node.data.props.borderColor,
  }));

  const flexDisabled = positioning === "absolute" || displayMode === "grid" || displayMode === "block";

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 mb-2">Layout</h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-500">Position</label>
            <div className="flex bg-zinc-800 rounded p-1 gap-1">
              <button
                className={`flex-1 p-1 text-xs rounded ${positioning === "flow" ? "bg-purple-600 text-white" : "hover:bg-zinc-700"}`}
                onClick={() => setProp((props: any) => (props.positioning = "flow"))}
                type="button"
              >
                Flow
              </button>
              <button
                className={`flex-1 p-1 text-xs rounded ${positioning === "absolute" ? "bg-purple-600 text-white" : "hover:bg-zinc-700"}`}
                onClick={() => setProp((props: any) => (props.positioning = "absolute"))}
                type="button"
              >
                Free
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500">Display</label>
            <div className="flex bg-zinc-800 rounded p-1 gap-1">
              {(["auto", "flex", "grid", "block"] as DisplayMode[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`flex-1 p-1 text-[10px] rounded ${
                    displayMode === v ? "bg-purple-600 text-white" : "hover:bg-zinc-700"
                  }`}
                  onClick={() => setProp((p: any) => (p.displayMode = v))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500">Direction</label>
            <div className="flex bg-zinc-800 rounded p-1 gap-1">
              <button
                type="button"
                className={`flex-1 p-1 text-xs rounded ${
                  flexDirection === "row" ? "bg-purple-600 text-white" : "hover:bg-zinc-700"
                }`}
                onClick={() => setProp((props: any) => (props.flexDirection = "row"))}
                disabled={flexDisabled}
                title={flexDisabled ? "Không dùng flex direction khi Display != flex hoặc Free" : ""}
              >
                Row
              </button>
              <button
                type="button"
                className={`flex-1 p-1 text-xs rounded ${
                  flexDirection === "column" ? "bg-purple-600 text-white" : "hover:bg-zinc-700"
                }`}
                onClick={() => setProp((props: any) => (props.flexDirection = "column"))}
                disabled={flexDisabled}
                title={flexDisabled ? "Không dùng flex direction khi Display != flex hoặc Free" : ""}
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
              isDisabled={flexDisabled}
            />
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h4 className="text-xs font-semibold text-zinc-400 mb-2">Size</h4>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Width"
              size="sm"
              variant="bordered"
              value={width || "100%"}
              onChange={(e) => setProp((p: any) => (p.width = e.target.value))}
              placeholder="e.g. 320px / 100% / auto"
            />
            <Input
              label="Height"
              size="sm"
              variant="bordered"
              value={height || "auto"}
              onChange={(e) => setProp((p: any) => (p.height = e.target.value))}
              placeholder="e.g. 56px / auto"
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
                disabled={flexDisabled}
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
                disabled={flexDisabled}
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
        <h4 className="text-xs font-semibold text-zinc-400 mb-2">Border</h4>

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Width"
            type="number"
            size="sm"
            variant="bordered"
            value={borderWidth}
            onChange={(e) =>
              setProp((p: any) => (p.borderWidth = parseInt(e.target.value || "0", 10)))
            }
          />
          <Input
            label="Color"
            size="sm"
            variant="bordered"
            value={borderColor || "rgba(255,255,255,.10)"}
            onChange={(e) => setProp((p: any) => (p.borderColor = e.target.value))}
          />
        </div>

        <div className="mt-2">
          <label className="text-[10px] text-zinc-500">Style</label>
          <div className="flex bg-zinc-800 rounded p-1 gap-1 overflow-x-auto">
            {(["none", "solid", "dashed", "dotted"] as BorderStyle[]).map((val) => (
              <button
                key={val}
                type="button"
                className={`flex-1 p-1 text-[10px] rounded whitespace-nowrap ${
                  borderStyle === val ? "bg-purple-600 text-white" : "hover:bg-zinc-700"
                }`}
                onClick={() => setProp((p: any) => (p.borderStyle = val))}
              >
                {val}
              </button>
            ))}
          </div>
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

    displayMode: "auto",

    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 0,

    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,.10)",
  },
  related: {
    settings: ContainerSettings,
  },
  rules: {
    canMoveIn: () => true,
    canDelete: () => true,
  },
};
