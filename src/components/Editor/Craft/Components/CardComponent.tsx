import React, { useMemo } from "react";
import { useNode, Element } from "@craftjs/core";
import { Card } from "@heroui/card";
import { Input } from "@heroui/input";

import { Container } from "./Container";
import { TextComponent } from "./TextComponent";
import { ButtonComponent } from "./ButtonComponent";

type CardRadius = "none" | "sm" | "md" | "lg";
type CardShadow = "none" | "sm" | "md" | "lg";

interface CardComponentProps {
  background: string;
  padding: number;
  radius: CardRadius;
  shadow: CardShadow;

  /** NEW: nhanh gọn để tràn cột */
  fullWidth?: boolean;

  /** NEW: custom width (ưu tiên hơn fullWidth) */
  width?: string | number;

  /** Optional: custom className */
  className?: string;

  /** Optional: min sizes (nếu muốn chỉnh) */
  minWidth?: string | number;
  minHeight?: string | number;
}

function toCssSize(v?: string | number) {
  if (v === undefined || v === null) return undefined;
  return typeof v === "number" ? `${v}px` : v;
}

export const CardComponent = ({
  background = "#27272a",
  padding = 20,
  radius = "md",
  shadow = "md",

  fullWidth = false,
  width,
  className = "",
  minWidth = 200,
  minHeight = 100,
}: CardComponentProps) => {
  const {
    id: nodeId,
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    id: node.id,
    selected: node.events.selected,
  }));

  // ✅ unique element id for inner canvas
  const contentId = useMemo(() => `card-content-${nodeId}`, [nodeId]);

  const cssWidth = toCssSize(width);
  const cssMinWidth = toCssSize(minWidth);
  const cssMinHeight = toCssSize(minHeight);

  // width priority: width prop > fullWidth
  const finalWidthStyle = cssWidth ?? (fullWidth ? "100%" : undefined);

  return (
    <Card
      ref={(ref: any) => connect(drag(ref))}
      className={[
        "min-h-[100px]", // giữ chiều cao tối thiểu bằng tailwind
        fullWidth || width ? "w-full" : "", // nếu có fullWidth/width thì cho w-full để ăn layout
        selected ? "ring-2 ring-purple-500" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        backgroundColor: background,
        padding: `${padding}px`,
        width: finalWidthStyle,
        minWidth: cssMinWidth,
        minHeight: cssMinHeight,
      }}
      radius={radius as any}
      shadow={shadow as any}
    >
      <Element
        id={contentId}
        is={Container}
        canvas
        background="transparent"
        padding={0}
        margin={0}
        width="100%"
        height="auto"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        gap={0}
        borderRadius={0}
      >
        <TextComponent
          text="Card Title"
          fontSize={20}
          fontWeight="600"
          textAlign="left"
          color="#000"
        />
        <div className="h-2" />
        <TextComponent
          text="This is a card. You can drop content here."
          fontSize={14}
          fontWeight="400"
          textAlign="left"
          color="#a1a1aa"
        />
        <div className="h-4" />
        <ButtonComponent
          text="Action"
          color="primary"
          variant="solid"
          size="sm"
          radius="md"
          fullWidth={false}
        />
      </Element>
    </Card>
  );
};

const CardSettings = () => {
  const {
    background,
    padding,
    radius,
    shadow,
    fullWidth,
    width,
    minWidth,
    minHeight,
    actions: { setProp },
  } = useNode((node) => ({
    background: node.data.props.background,
    padding: node.data.props.padding,
    radius: node.data.props.radius,
    shadow: node.data.props.shadow,

    fullWidth: node.data.props.fullWidth,
    width: node.data.props.width,
    minWidth: node.data.props.minWidth,
    minHeight: node.data.props.minHeight,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-zinc-400 block mb-1">Appearance</label>

        <div className="mb-2">
          <label className="text-[10px] text-zinc-500 block">Background</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={background}
              className="w-8 h-8 rounded cursor-pointer bg-transparent"
              onChange={(e) => setProp((props: any) => (props.background = e.target.value))}
            />
            <Input
              size="sm"
              variant="bordered"
              value={background}
              onChange={(e) => setProp((props: any) => (props.background = e.target.value))}
              className="flex-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-500 block">Radius</label>
            <select
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-1 text-white"
              value={radius}
              onChange={(e) => setProp((props: any) => (props.radius = e.target.value))}
            >
              {["none", "sm", "md", "lg"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 block">Shadow</label>
            <select
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-1 text-white"
              value={shadow}
              onChange={(e) => setProp((props: any) => (props.shadow = e.target.value))}
            >
              {["none", "sm", "md", "lg"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">Spacing</label>
        <Input
          label="Inner Padding"
          type="number"
          size="sm"
          variant="bordered"
          value={padding}
          onChange={(e) =>
            setProp((props: any) => (props.padding = parseInt(e.target.value || "0", 10)))
          }
        />
      </div>

      {/* NEW: Width controls */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-400 block mb-1">Layout</label>

        <label className="flex items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={!!fullWidth}
            onChange={(e) => setProp((props: any) => (props.fullWidth = e.target.checked))}
          />
          Full width (100%)
        </label>

        <Input
          label='Width (e.g. "100%", "420px", "auto")'
          size="sm"
          variant="bordered"
          value={width ?? ""}
          onChange={(e) =>
            setProp((props: any) => (props.width = e.target.value.trim() || undefined))
          }
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Min width (px)"
            type="number"
            size="sm"
            variant="bordered"
            value={minWidth ?? 200}
            onChange={(e) =>
              setProp((props: any) => (props.minWidth = parseInt(e.target.value || "0", 10)))
            }
          />
          <Input
            label="Min height (px)"
            type="number"
            size="sm"
            variant="bordered"
            value={minHeight ?? 100}
            onChange={(e) =>
              setProp((props: any) => (props.minHeight = parseInt(e.target.value || "0", 10)))
            }
          />
        </div>
      </div>
    </div>
  );
};

CardComponent.craft = {
  displayName: "Card",
  props: {
    background: "#27272a",
    padding: 20,
    radius: "md",
    shadow: "md",

    fullWidth: false,
    width: undefined,
    minWidth: 200,
    minHeight: 100,
    className: "",
  },
  related: {
    settings: CardSettings,
  },
};
