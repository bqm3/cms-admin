/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useNode } from "@craftjs/core";
import { useState, useEffect, useMemo } from "react";
import ContentEditable from "react-contenteditable";
import { useEditorData } from "../../../../context/EditorDataContext";

interface HeadingProps {
  text?: string;
  level?: "h1" | "h2" | "h3" | "h4";
  align?: "left" | "center" | "right";
  color?: string;
}

export const HeadingComponent = ({
  text = "Heading",
  level = "h2",
  align = "left",
  color = "#000000",
}: HeadingProps) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const [editable, setEditable] = useState(false);
  const { data } = useEditorData();

  const resolveToken = (path: string, src: any) => {
    try {
      const parts = path.replace(/\[(\d+)\]/g, '.$1').split(".").map((p) => p.trim());
      let cur = src;
      for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p];
      }
      return cur;
    } catch (e) {
      return undefined;
    }
  };

  const resolvedText = useMemo(() => {
    if (!text || typeof text !== "string") return text;
    return text.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
      const value = resolveToken(token.trim(), data);
      return value === undefined || value === null ? match : String(value);
    });
  }, [text, data]);

  useEffect(() => {
    if (selected) {
      return;
    }
    setEditable(false);
  }, [selected]);

  const sizes = {
    h1: "text-4xl font-bold",
    h2: "text-3xl font-semibold",
    h3: "text-2xl font-medium",
    h4: "text-xl font-medium",
  };

  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      className={`${selected ? "ring-2 ring-purple-500 rounded p-1" : "p-1"}`}
      onClick={() => selected && setEditable(true)}
    >
      <ContentEditable
        className={`${sizes[level]} outline-none`}
        disabled={!editable}
        html={editable ? text : resolvedText}
        style={{ textAlign: align, color }}
        tagName={level}
        onChange={(e) => {
          setProp(
            (props: any) =>
              (props.text = e.target.value.replace(/<\/?[^>]+(>|$)/g, "")),
            500,
          );
        }}
      />
    </div>
  );
};

const HeadingSettings = () => {
  const {
    actions: { setProp },
    level,
    align,
    color,
  } = useNode((node) => ({
    level: node.data.props.level,
    align: node.data.props.align,
    color: node.data.props.color,
  }));

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-zinc-400 block mb-1">Level</label>
        <div className="flex bg-zinc-800 rounded-md p-1 gap-1">
          {["h1", "h2", "h3", "h4"].map((l) => (
            <button
              key={l}
              className={`flex-1 py-1 text-xs rounded ${level === l ? "bg-purple-600 text-white" : "hover:bg-zinc-700 text-zinc-300"}`}
              onClick={() => setProp((props: any) => (props.level = l))}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-400 block mb-1">Alignment</label>
        <div className="flex bg-zinc-800 rounded-md p-1 gap-1">
          {["left", "center", "right"].map((a) => (
            <button
              key={a}
              className={`flex-1 py-1 text-xs rounded ${align === a ? "bg-purple-600 text-white" : "hover:bg-zinc-700 text-zinc-300"}`}
              onClick={() => setProp((props: any) => (props.align = a))}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-400 block mb-1">Color</label>
        <input
          className="w-full h-8 cursor-pointer rounded bg-zinc-800 border-none px-1"
          type="color"
          value={color}
          onChange={(e) =>
            setProp((props: any) => (props.color = e.target.value))
          }
        />
      </div>
    </div>
  );
};

HeadingComponent.craft = {
  displayName: "Heading",
  props: {
    text: "Heading",
    level: "h2",
    align: "left",
    color: "#000000",
  },
  related: {
    settings: HeadingSettings,
  },
};
