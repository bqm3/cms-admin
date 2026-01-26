/* eslint-disable prettier/prettier */
import React, { useMemo } from "react";
import { useNode } from "@craftjs/core";
import { ChevronDown } from "lucide-react";

type AccordionItem = { title: string; content: string };

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple: boolean;
  defaultOpenIndex: number; // -1 = none
  cardBg: string;
  border: string;
  titleColor: string;
  contentColor: string;
}

export const AccordionComponent = ({
  items = [
    { title: "Is MimicPC suitable for beginners?", content: "Yes. You can start with presets and templates." },
    { title: "Can I try MimicPC for free?", content: "Depending on plan, free trials may be available." },
    { title: "How does pricing work?", content: "Pricing depends on compute resources and usage." },
  ],
  allowMultiple = false,
  defaultOpenIndex = 0,
  cardBg = "rgba(24,24,27,.55)",
  border = "1px solid rgba(255,255,255,.08)",
  titleColor = "#FFFFFF",
  contentColor = "#A1A1AA",
}: AccordionProps) => {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  // internal state without storing in craft props (simple + stable)
  const [open, setOpen] = React.useState<number[]>(() => {
    if (defaultOpenIndex === -1) return [];
    return [defaultOpenIndex];
  });

  const toggle = (idx: number) => {
    setOpen((prev) => {
      const exists = prev.includes(idx);
      if (allowMultiple) {
        return exists ? prev.filter((x) => x !== idx) : [...prev, idx];
      }
      return exists ? [] : [idx];
    });
  };

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        outline: selected ? "1px dashed rgba(255,255,255,.25)" : "none",
        outlineOffset: 4,
      }}
      className="space-y-3"
    >
      {safeItems.map((it, idx) => {
        const isOpen = open.includes(idx);
        return (
          <div key={idx} style={{ background: cardBg, border, borderRadius: 16 }}>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              onClick={() => toggle(idx)}
            >
              <div className="font-semibold text-sm" style={{ color: titleColor }}>
                {it.title}
              </div>
              <ChevronDown
                size={18}
                style={{
                  opacity: 0.9,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform .15s ease",
                }}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-4 text-sm" style={{ color: contentColor }}>
                {it.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const AccordionSettings = () => {
  const { actions: { setProp }, items, allowMultiple, defaultOpenIndex, cardBg, border, titleColor, contentColor } =
    useNode((node) => ({
      items: node.data.props.items,
      allowMultiple: node.data.props.allowMultiple,
      defaultOpenIndex: node.data.props.defaultOpenIndex,
      cardBg: node.data.props.cardBg,
      border: node.data.props.border,
      titleColor: node.data.props.titleColor,
      contentColor: node.data.props.contentColor,
    }));

  const updateItem = (idx: number, key: "title" | "content", value: string) => {
    setProp((p: any) => {
      const next = [...(p.items || [])];
      next[idx] = { ...(next[idx] || { title: "", content: "" }), [key]: value };
      p.items = next;
    });
  };

  const addItem = () => {
    setProp((p: any) => {
      p.items = [...(p.items || []), { title: "New question", content: "Answer..." }];
    });
  };

  const removeItem = (idx: number) => {
    setProp((p: any) => {
      p.items = (p.items || []).filter((_: any, i: number) => i !== idx);
    });
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!allowMultiple}
          onChange={(e) => setProp((p: any) => (p.allowMultiple = e.target.checked))}
        />
        Allow multiple open
      </label>

      <div>
        <div className="text-xs opacity-70 mb-1">Default open index (-1 none)</div>
        <input
          type="number"
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={defaultOpenIndex}
          onChange={(e) => setProp((p: any) => (p.defaultOpenIndex = Number(e.target.value)))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs opacity-70 mb-1">Card bg</div>
          <input
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={cardBg}
            onChange={(e) => setProp((p: any) => (p.cardBg = e.target.value))}
          />
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">Border</div>
          <input
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={border}
            onChange={(e) => setProp((p: any) => (p.border = e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs opacity-70 mb-1">Title color</div>
          <input
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={titleColor}
            onChange={(e) => setProp((p: any) => (p.titleColor = e.target.value))}
          />
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">Content color</div>
          <input
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={contentColor}
            onChange={(e) => setProp((p: any) => (p.contentColor = e.target.value))}
          />
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs opacity-70">Items</div>
          <button
            type="button"
            className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs"
            onClick={addItem}
          >
            + Add
          </button>
        </div>

        <div className="space-y-2 mt-2">
          {(items || []).map((it: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-xs opacity-70">#{idx}</div>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10"
                  onClick={() => removeItem(idx)}
                >
                  Remove
                </button>
              </div>

              <input
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm"
                value={it.title || ""}
                onChange={(e) => updateItem(idx, "title", e.target.value)}
                placeholder="Question"
              />
              <textarea
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm"
                rows={3}
                value={it.content || ""}
                onChange={(e) => updateItem(idx, "content", e.target.value)}
                placeholder="Answer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

(AccordionComponent as any).craft = {
  displayName: "Accordion / FAQ",
  props: {
    items: [
      { title: "Is MimicPC suitable for beginners?", content: "Yes. You can start with presets and templates." },
      { title: "Can I try MimicPC for free?", content: "Depending on plan, free trials may be available." },
      { title: "How does pricing work?", content: "Pricing depends on compute resources and usage." },
    ],
    allowMultiple: false,
    defaultOpenIndex: 0,
    cardBg: "rgba(24,24,27,.55)",
    border: "1px solid rgba(255,255,255,.08)",
    titleColor: "#FFFFFF",
    contentColor: "#A1A1AA",
  },
  related: {
    settings: AccordionSettings,
  },
};
