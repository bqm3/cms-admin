/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import { useNode } from "@craftjs/core";
import { Input } from "@heroui/input";
import { useEditorMode } from "../utils/useEditorMode";

type InputProps = {
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "number" | "password";
  radius?: "none" | "sm" | "md" | "lg";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  variant?: "flat" | "bordered" | "faded" | "underlined";
};

export const InputComponent: React.FC<InputProps> & { craft: any } = ({
  label = "",
  placeholder = "Email",
  type = "email",
  radius = "md",
  size = "md",
  fullWidth = true,
  variant = "bordered",
}) => {
  const enabled = useEditorMode();

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
        "w-full",
        selected ? "outline outline-2 outline-indigo-500/60 rounded-xl" : "",
      ].join(" ")}
    >
      <Input
        label={label || undefined}
        placeholder={placeholder}
        type={type}
        radius={radius}
        size={size}
        variant={variant}
        fullWidth={fullWidth}
        isDisabled={enabled} // preview thì disable để khỏi focus làm “kẹt” drag
      />
    </div>
  );
};

const InputSettings = () => {
  const {
    actions: { setProp },
    placeholder,
    label,
    type,
    radius,
    size,
    variant,
  } = useNode((node: any) => node.data.props);

  return (
    <div className="space-y-3 text-sm">
      <div>
        <div className="mb-1 opacity-80">Label</div>
        <input
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
          value={label}
          onChange={(e) => setProp((p: any) => (p.label = e.target.value))}
        />
      </div>

      <div>
        <div className="mb-1 opacity-80">Placeholder</div>
        <input
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
          value={placeholder}
          onChange={(e) => setProp((p: any) => (p.placeholder = e.target.value))}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="mb-1 opacity-80">Type</div>
          <select
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
            value={type}
            onChange={(e) => setProp((p: any) => (p.type = e.target.value))}
          >
            <option value="text">text</option>
            <option value="email">email</option>
            <option value="number">number</option>
            <option value="password">password</option>
          </select>
        </div>

        <div>
          <div className="mb-1 opacity-80">Variant</div>
          <select
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
            value={variant}
            onChange={(e) => setProp((p: any) => (p.variant = e.target.value))}
          >
            <option value="bordered">bordered</option>
            <option value="flat">flat</option>
            <option value="faded">faded</option>
            <option value="underlined">underlined</option>
          </select>
        </div>

        <div>
          <div className="mb-1 opacity-80">Radius</div>
          <select
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
            value={radius}
            onChange={(e) => setProp((p: any) => (p.radius = e.target.value))}
          >
            <option value="none">none</option>
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
        </div>

        <div>
          <div className="mb-1 opacity-80">Size</div>
          <select
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
            value={size}
            onChange={(e) => setProp((p: any) => (p.size = e.target.value))}
          >
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
        </div>
      </div>
    </div>
  );
};

InputComponent.craft = {
  displayName: "Input",
  props: {
    label: "",
    placeholder: "Email",
    type: "email",
    radius: "md",
    size: "md",
    fullWidth: true,
    variant: "bordered",
  },
  related: {
    settings: InputSettings,
  },
};
