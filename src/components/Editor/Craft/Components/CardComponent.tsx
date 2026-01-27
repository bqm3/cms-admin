import { useNode, Element } from "@craftjs/core";
import { Card } from "@heroui/card";
import { Input } from "@heroui/input";
import React from "react";

import { Container } from "./Container";
import { TextComponent } from "./TextComponent";
import { ButtonComponent } from "./ButtonComponent";

interface CardComponentProps {
  background: string;
  padding: number;
  radius: "none" | "sm" | "md" | "lg";
  shadow: "none" | "sm" | "md" | "lg";
}

export const CardComponent = ({
  background = "#27272a",
  padding = 20,
  radius = "md",
  shadow = "md"
}: CardComponentProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <Card
      ref={(ref: any) => connect(drag(ref))}
      className={`min-w-[200px] min-h-[100px] ${selected ? "ring-2 ring-purple-500" : ""}`}
      style={{ backgroundColor: background, padding: `${padding}px` }}
      radius={radius as any}
      shadow={shadow as any}
    >
      <Element
        id="card-content"
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
    actions: { setProp }
  } = useNode((node) => ({
    background: node.data.props.background,
    padding: node.data.props.padding,
    radius: node.data.props.radius,
    shadow: node.data.props.shadow
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
              onChange={(e) => setProp((props: any) => props.background = e.target.value)}
            />
            <Input
              size="sm"
              variant="bordered"
              value={background}
              onChange={(e) => setProp((props: any) => props.background = e.target.value)}
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
              onChange={(e) => setProp((props: any) => props.radius = e.target.value)}
            >
              {['none', 'sm', 'md', 'lg'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 block">Shadow</label>
            <select
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-1 text-white"
              value={shadow}
              onChange={(e) => setProp((props: any) => props.shadow = e.target.value)}
            >
              {['none', 'sm', 'md', 'lg'].map(s => <option key={s} value={s}>{s}</option>)}
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
          onChange={(e) => setProp((props: any) => props.padding = parseInt(e.target.value))}
        />
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
    shadow: "md"
  },
  related: {
    settings: CardSettings,
  },
};
