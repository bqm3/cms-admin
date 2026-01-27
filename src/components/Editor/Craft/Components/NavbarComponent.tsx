/* eslint-disable react/jsx-sort-props */
/* eslint-disable prettier/prettier */
import React from "react";
import { useEditor, useNode } from "@craftjs/core";
import { Button } from "@heroui/button";

type NavItem = { label: string; href: string };

export interface NavbarProps {
  brandText: string;
  brandLogo?: string; // image url (optional)
  items: NavItem[];
  sticky: boolean;
  blur: boolean;
  background: string; // rgba
  border: string;
  paddingX: number;
  paddingY: number;

  ctaText: string;
  ctaHref: string;
  ctaNewTab: boolean;
}

export const NavbarComponent = ({
  brandText = "MimicPC",
  brandLogo = "",
  items = [
    { label: "Home", href: "#" },
    { label: "Docs", href: "#docs" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  sticky = false,
  blur = true,
  background = "rgba(7,10,15,.6)",
  border = "1px solid rgba(255,255,255,.08)",
  paddingX = 24,
  paddingY = 14,

  ctaText = "Free Launch",
  ctaHref = "https://example.com",
  ctaNewTab = true,
}: NavbarProps) => {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const Wrapper: any = sticky ? "div" : React.Fragment;

  const nav = (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        width: "100%",
        boxSizing: "border-box",
        background,
        borderBottom: border,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        backdropFilter: blur ? "blur(10px)" : "none",
        WebkitBackdropFilter: blur ? "blur(10px)" : "none",
        outline: selected ? "1px dashed rgba(255,255,255,.25)" : "none",
        outlineOffset: 4,
      }}
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {brandLogo ? (
            <img src={brandLogo} alt="logo" className="w-7 h-7 rounded-md object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-md bg-white/10 border border-white/10" />
          )}
          <div className="font-bold text-black">{brandText}</div>
        </div>

        <div className="hidden md:flex items-center gap-5 text-sm">
          {items.map((it, idx) => (
            <a
              key={idx}
              href={it.href}
              className="text-white/70 hover:text-black transition"
              onClick={(e) => {
                // editor mode: tránh navigate làm mất selection
                e.stopPropagation();
              }}
            >
              {it.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            radius="full"
            className="bg-white/10 text-white border border-white/10"
            onPress={() => {}}
          >
            Join Us
          </Button>

          <a
            href={ctaHref}
            target={ctaNewTab ? "_blank" : "_self"}
            rel={ctaNewTab ? "noreferrer" : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              radius="full"
              className="bg-amber-950 text-white"
              onPress={() => {}}
            >
              {ctaText}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );

  if (!sticky) return nav;

  return (
    <Wrapper>
      <div style={{ position: "sticky", top: 0, zIndex: 50 }}>
        {nav}
      </div>
    </Wrapper>
  );
};

const NavbarSettings = () => {
  const { actions: { setProp }, brandText, brandLogo, items, sticky, blur, background, border, paddingX, paddingY, ctaText, ctaHref, ctaNewTab } =
    useNode((node) => ({
      brandText: node.data.props.brandText,
      brandLogo: node.data.props.brandLogo,
      items: node.data.props.items,
      sticky: node.data.props.sticky,
      blur: node.data.props.blur,
      background: node.data.props.background,
      border: node.data.props.border,
      paddingX: node.data.props.paddingX,
      paddingY: node.data.props.paddingY,
      ctaText: node.data.props.ctaText,
      ctaHref: node.data.props.ctaHref,
      ctaNewTab: node.data.props.ctaNewTab,
    }));

  const updateItem = (idx: number, key: "label" | "href", value: string) => {
    setProp((p: any) => {
      const next = [...(p.items || [])];
      next[idx] = { ...(next[idx] || { label: "", href: "" }), [key]: value };
      p.items = next;
    });
  };

  const addItem = () => {
    setProp((p: any) => {
      p.items = [...(p.items || []), { label: "New", href: "#new" }];
    });
  };

  const removeItem = (idx: number) => {
    setProp((p: any) => {
      p.items = (p.items || []).filter((_: any, i: number) => i !== idx);
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs opacity-70 mb-1">Brand text</div>
        <input
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={brandText}
          onChange={(e) => setProp((p: any) => (p.brandText = e.target.value))}
        />
      </div>

      <div>
        <div className="text-xs opacity-70 mb-1">Brand logo URL</div>
        <input
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={brandLogo || ""}
          onChange={(e) => setProp((p: any) => (p.brandLogo = e.target.value))}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!sticky} onChange={(e) => setProp((p: any) => (p.sticky = e.target.checked))} />
          Sticky
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!blur} onChange={(e) => setProp((p: any) => (p.blur = e.target.checked))} />
          Blur
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs opacity-70 mb-1">Padding X</div>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={paddingX}
            onChange={(e) => setProp((p: any) => (p.paddingX = Number(e.target.value)))}
          />
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">Padding Y</div>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={paddingY}
            onChange={(e) => setProp((p: any) => (p.paddingY = Number(e.target.value)))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs opacity-70 mb-1">Background</div>
          <input
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={background}
            onChange={(e) => setProp((p: any) => (p.background = e.target.value))}
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

      <div className="pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs opacity-70">Menu items</div>
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
                value={it.label || ""}
                onChange={(e) => updateItem(idx, "label", e.target.value)}
                placeholder="Label"
              />
              <input
                className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm"
                value={it.href || ""}
                onChange={(e) => updateItem(idx, "href", e.target.value)}
                placeholder="#pricing"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <div className="text-xs opacity-70 mb-1">CTA</div>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={ctaText}
            onChange={(e) => setProp((p: any) => (p.ctaText = e.target.value))}
            placeholder="CTA text"
          />
          <input
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
            value={ctaHref}
            onChange={(e) => setProp((p: any) => (p.ctaHref = e.target.value))}
            placeholder="https://..."
          />
        </div>
        <label className="flex items-center gap-2 text-sm mt-2">
          <input type="checkbox" checked={!!ctaNewTab} onChange={(e) => setProp((p: any) => (p.ctaNewTab = e.target.checked))} />
          Open in new tab
        </label>
      </div>
    </div>
  );
};

(NavbarComponent as any).craft = {
  displayName: "Navbar",
  props: {
    brandText: "MimicPC",
    brandLogo: "",
    items: [
      { label: "Home", href: "#" },
      { label: "Docs", href: "#docs" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    sticky: true,
    blur: true,
    background: "rgba(7,10,15,.6)",
    border: "1px solid rgba(255,255,255,.08)",
    paddingX: 24,
    paddingY: 14,
    ctaText: "Free Launch",
    ctaHref: "https://example.com",
    ctaNewTab: true,
  },
  related: {
    settings: NavbarSettings,
  },
};
