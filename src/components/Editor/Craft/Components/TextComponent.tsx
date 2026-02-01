/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useNode } from "@craftjs/core";
import { useState, useEffect, useMemo } from "react";
import ContentEditable from "react-contenteditable";
import { Input } from "@heroui/input";
import { useEditorData } from "../../../../context/EditorDataContext";
import { useEditorMode } from "../utils/useEditorMode";

export const TextComponent = ({
  text = "Type here...",
  fontSize = 16,
  fontWeight = "400",
  textAlign = "left",
  color = "#e4e4e7",
  lineHeight = "1.5",
  letterSpacing = "normal",

  // ✅ NEW: padding 4 phía
  paddingTop = 0,
  paddingRight = 0,
  paddingBottom = 0,
  paddingLeft = 0,

  // ✅ Links
  href = "",
  openInNewTab = false,
  className = "",
}: {
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  color?: string;
  lineHeight?: string;
  letterSpacing?: string;

  // ✅ NEW
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  href?: string;
  openInNewTab?: boolean;
  className?: string;
}) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const [editable, setEditable] = useState(false);
  const { data } = useEditorData();
  const enabled = useEditorMode();

  const resolveToken = (path: string, src: any) => {
    try {
      const parts = path
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .map((p) => p.trim());
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

  const resolvedHref = useMemo(() => {
    if (!href || typeof href !== "string") return href;
    return href.replace(/\{\{([^}]+)\}\}/g, (match, token) => {
      const value = resolveToken(token.trim(), data);
      return value === undefined || value === null ? match : String(value);
    });
  }, [href, data]);

  useEffect(() => {
    if (selected) return;
    setEditable(false);
  }, [selected]);

  const isLink = !!href;

  const content = (
    <ContentEditable
      disabled={!editable}
      html={editable ? text : resolvedText}
      style={{
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight as any,
        textAlign: textAlign as any,
        color,
        lineHeight: lineHeight || "1.5",
        letterSpacing: letterSpacing || "normal",
        margin: 0,
      }}
      tagName="p"
      onChange={(e) => {
        setProp((props: any) => (props.text = e.target.value));
      }}
    />
  );

  return (
    <div
      ref={(ref) => {
        if (!ref) return;
        if (enabled) connect(drag(ref));
        else connect(ref);
      }}
      className={`${selected
        ? "border-1 border-blue-500 border-dashed"
        : "border border-transparent"
        } min-w-[50px] ${className} ${isLink ? "cursor-pointer" : ""}`}
      style={{
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        boxSizing: "border-box",
      }}
      onClick={() => {
        if (enabled && selected) setEditable(true);
      }}
    >
      {isLink && !enabled ? (
        <a
          href={resolvedHref}
          target={openInNewTab ? "_blank" : undefined}
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
};

export const TextSettings = () => {
  const {
    fontSize,
    fontWeight,
    textAlign,
    color,
    lineHeight,
    letterSpacing,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    href,
    openInNewTab,
    actions: { setProp },
  } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
    fontWeight: node.data.props.fontWeight,
    textAlign: node.data.props.textAlign,
    color: node.data.props.color,
    lineHeight: node.data.props.lineHeight,
    letterSpacing: node.data.props.letterSpacing,

    paddingTop: node.data.props.paddingTop,
    paddingRight: node.data.props.paddingRight,
    paddingBottom: node.data.props.paddingBottom,
    paddingLeft: node.data.props.paddingLeft,

    href: node.data.props.href,
    openInNewTab: node.data.props.openInNewTab,
  }));

  return (
    <div className="space-y-4">
      {/* Typography */}
      <div>
        <label className="text-xs text-zinc-500 block mb-2">Typography</label>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">Font size</label>
            <input
              type="number"
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
              value={fontSize ?? 16}
              onChange={(e) =>
                setProp((p: any) => (p.fontSize = Number(e.target.value) || 16))
              }
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">Font weight</label>
            <select
              className="w-full bg-zinc-800 border border-white/10 rounded text-xs p-2 text-white"
              value={fontWeight ?? "400"}
              onChange={(e) => setProp((p: any) => (p.fontWeight = e.target.value))}
            >
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="600">600</option>
              <option value="700">700</option>
              <option value="800">800</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">Text align</label>
            <select
              className="w-full bg-zinc-800 border border-white/10 rounded text-xs p-2 text-white"
              value={textAlign ?? "left"}
              onChange={(e) => setProp((p: any) => (p.textAlign = e.target.value))}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">Color</label>
            <input
              type="color"
              className="w-full h-9 bg-zinc-800 border border-white/10 rounded"
              value={color ?? "#e4e4e7"}
              onChange={(e) => setProp((p: any) => (p.color = e.target.value))}
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">Line height</label>
            <input
              type="text"
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
              value={lineHeight ?? "1.5"}
              onChange={(e) => setProp((p: any) => (p.lineHeight = e.target.value))}
              placeholder="e.g. 1.5"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">Letter spacing</label>
            <input
              type="text"
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
              value={letterSpacing ?? "normal"}
              onChange={(e) => setProp((p: any) => (p.letterSpacing = e.target.value))}
              placeholder="e.g. normal / 0.5px"
            />
          </div>
        </div>
      </div>

      {/* Padding */}
      <div>
        <label className="text-xs text-zinc-500 block mb-2">Padding (px)</label>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">Top</label>
            <input
              type="number"
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
              value={paddingTop ?? 0}
              onChange={(e) =>
                setProp((p: any) => (p.paddingTop = Number(e.target.value) || 0))
              }
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">Right</label>
            <input
              type="number"
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
              value={paddingRight ?? 0}
              onChange={(e) =>
                setProp((p: any) => (p.paddingRight = Number(e.target.value) || 0))
              }
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">Bottom</label>
            <input
              type="number"
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
              value={paddingBottom ?? 0}
              onChange={(e) =>
                setProp((p: any) => (p.paddingBottom = Number(e.target.value) || 0))
              }
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 mb-1 block">Left</label>
            <input
              type="number"
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-2 text-white"
              value={paddingLeft ?? 0}
              onChange={(e) =>
                setProp((p: any) => (p.paddingLeft = Number(e.target.value) || 0))
              }
            />
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10"
            onClick={() =>
              setProp((p: any) => {
                p.paddingTop = 0;
                p.paddingRight = 0;
                p.paddingBottom = 0;
                p.paddingLeft = 0;
              })
            }
          >
            Reset
          </button>

          <button
            type="button"
            className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10"
            onClick={() =>
              setProp((p: any) => {
                p.paddingTop = 8;
                p.paddingRight = 8;
                p.paddingBottom = 8;
                p.paddingLeft = 8;
              })
            }
          >
            8px all
          </button>
        </div>
      </div>

      {/* Link Settings */}
      <div className="border-t border-white/10 pt-4">
        <label className="text-xs text-zinc-500 block mb-2">Link</label>
        <div className="space-y-2">
          <Input
            label="URL (href)"
            size="sm"
            variant="bordered"
            value={href || ""}
            onChange={(e) => setProp((p: any) => (p.href = e.target.value))}
            placeholder="e.g. #docs or https://..."
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="openInNewTab"
              checked={openInNewTab || false}
              onChange={(e) => setProp((p: any) => (p.openInNewTab = e.target.checked))}
            />
            <label htmlFor="openInNewTab" className="text-[10px] text-zinc-500">Open in new tab</label>
          </div>
        </div>
      </div>
    </div>
  );
};



TextComponent.craft = {
  displayName: "Text",
  props: {
    text: "Type here...",
    fontSize: 16,
    fontWeight: "400",
    textAlign: "left",
    color: "#e4e4e7",
    lineHeight: "1.5",
    letterSpacing: "normal",

    // ✅ NEW
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    href: "",
    openInNewTab: false,
    className: "",
  },
  related: {
    settings: TextSettings,
  },
};
