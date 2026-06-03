import React from "react";
import { useNode } from "@craftjs/core";
import { Input } from "@heroui/input";
import { TiptapEditor } from "../../../Common/TiptapEditor";
import { useEditorMode } from "../utils/useEditorMode";

type TiptapComponentProps = {
  content?: string;
  placeholder?: string;
  minHeight?: number;
};

export const TiptapComponent: React.FC<TiptapComponentProps> & { craft: any } = ({
  content = "<p>Nhập nội dung...</p>",
  placeholder = "Nhập nội dung...",
  minHeight = 280,
}) => {
  const editorEnabled = useEditorMode();

  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className={[
        "w-full rounded-2xl",
        selected ? "outline outline-2 outline-indigo-500/60" : "",
      ].join(" ")}
      style={{ minHeight }}
    >
      <TiptapEditor
        value={content}
        onChange={(value) =>
          setProp((p: any) => {
            p.content = value;
          })
        }
        placeholder={placeholder}
        editable={editorEnabled}
      />
    </div>
  );
};

const TiptapSettings = () => {
  const {
    content,
    placeholder,
    minHeight,
    actions: { setProp },
  } = useNode((node) => ({
    content: node.data.props.content,
    placeholder: node.data.props.placeholder,
    minHeight: node.data.props.minHeight,
  }));

  return (
    <div className="space-y-4">
      <Input
        label="Placeholder"
        size="sm"
        value={placeholder || ""}
        variant="bordered"
        onChange={(e) => setProp((p: any) => (p.placeholder = e.target.value))}
      />

      <Input
        label="Min height"
        size="sm"
        type="number"
        value={String(minHeight ?? 280)}
        variant="bordered"
        onChange={(e) => setProp((p: any) => (p.minHeight = Number(e.target.value) || 280))}
      />

      <div>
        <label className="mb-2 block text-xs text-zinc-500">HTML content</label>
        <textarea
          className="min-h-40 w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none"
          value={content || ""}
          onChange={(e) => setProp((p: any) => (p.content = e.target.value))}
        />
      </div>
    </div>
  );
};

TiptapComponent.craft = {
  displayName: "Tiptap",
  props: {
    content: "<p>Nhập nội dung...</p>",
    placeholder: "Nhập nội dung...",
    minHeight: 280,
  },
  related: {
    settings: TiptapSettings,
  },
};
