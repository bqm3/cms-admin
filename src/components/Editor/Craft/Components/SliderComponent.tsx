/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from "react";
import { useEditor, useNode } from "@craftjs/core";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

/** 1 slide */
type SlideItem = {
  image: string;     // background image url
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
};

export interface SliderProps {
  slides: SlideItem[];
  height: string; // e.g. "420px"
  overlay: string; // rgba
  autoPlay: boolean;
  intervalMs: number;

  contentAlign: "left" | "center";
  maxContentWidth: string; // e.g. "1200px"
  paddingX: number;
  paddingY: number;

  titleColor: string;
  subtitleColor: string;
}

export const SliderComponent = ({
  slides = [
    {
      image:
        "https://images.unsplash.com/photo-1520975693411-35a7c4f4b3ea?auto=format&fit=crop&w=2000&q=80",
      title: "Build faster with MimicPC",
      subtitle: "GPU-ready AI workflows for images, video, and audio.",
      ctaText: "Free Launch",
      ctaHref: "https://example.com",
    },
    {
      image:
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=2000&q=80",
      title: "Private & Secure",
      subtitle: "Run your models with fast, isolated compute.",
      ctaText: "View Docs",
      ctaHref: "#docs",
    },
  ],
  height = "420px",
  overlay = "rgba(0,0,0,.45)",
  autoPlay = true,
  intervalMs = 4000,

  contentAlign = "left",
  maxContentWidth = "1200px",
  paddingX = 24,
  paddingY = 48,

  titleColor = "rgba(255,255,255,.95)",
  subtitleColor = "rgba(255,255,255,.75)",
}: SliderProps) => {
  const { enabled } = useEditor((s) => ({ enabled: s.options.enabled }));
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const safeSlides = useMemo(() => (Array.isArray(slides) && slides.length ? slides : []), [slides]);
  const [idx, setIdx] = useState(0);

  // autoplay chỉ chạy khi preview/runtime (không chạy lúc đang edit)
  useEffect(() => {
    if (enabled) return;
    if (!autoPlay) return;
    if (safeSlides.length <= 1) return;

    const t = setInterval(() => {
      setIdx((p) => (p + 1) % safeSlides.length);
    }, Math.max(1200, intervalMs || 4000));

    return () => clearInterval(t);
  }, [enabled, autoPlay, intervalMs, safeSlides.length]);

  const cur = safeSlides[idx] || safeSlides[0];

  const alignClass =
    contentAlign === "center"
      ? "items-center text-center"
      : "items-start text-left";

  const next = (e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIdx((p) => (p + 1) % safeSlides.length);
  };

  const prev = (e?: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIdx((p) => (p - 1 + safeSlides.length) % safeSlides.length);
  };

  return (
    <div
      ref={(ref: any) => ref && connect(drag(ref))}
      className={`${selected ? "ring-2 ring-purple-500" : ""} w-full`}
      style={{
        width: "100%",
        height,
        position: "relative",
        overflow: "hidden",
        borderRadius: 16,
        boxSizing: "border-box",
        background: 'rgba(0,0,0,.45)'
      }}
    >
      {/* background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${cur?.image || ""})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scale(1.02)",
        }}
      />

      {/* overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: overlay,
        }}
      />

      {/* content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          width: "100%",
          paddingLeft: paddingX,
          paddingRight: paddingX,
          paddingTop: paddingY,
          paddingBottom: paddingY,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className={`w-full flex flex-col gap-3 ${alignClass}`}
          style={{
            maxWidth: maxContentWidth,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Title */}
          <div
            style={{
              color: titleColor,
              fontSize: 42,
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {cur?.title || "Your title"}
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: subtitleColor,
              fontSize: 16,
              fontWeight: 500,
              maxWidth: contentAlign === "center" ? "720px" : "640px",
            }}
          >
            {cur?.subtitle || "Your subtitle"}
          </div>

          {/* CTA */}
          {!!cur?.ctaText && (
            <div className={`flex gap-2 ${contentAlign === "center" ? "justify-center" : "justify-start"}`}>
              <a
                href={cur?.ctaHref || "#"}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  // editor: không navigate
                  if (enabled) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                onMouseDown={(e) => enabled && e.preventDefault()}
              >
                <Button radius="full" size="sm" className="bg-white text-black">
                  {cur?.ctaText}
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* controls (ẩn khi chỉ có 1 slide) */}
      {safeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            onMouseDown={(e) => enabled && e.preventDefault()}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 3,
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.25)",
              background: "rgba(0,0,0,.25)",
              color: "white",
              cursor: "pointer",
            }}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={next}
            onMouseDown={(e) => enabled && e.preventDefault()}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 3,
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.25)",
              background: "rgba(0,0,0,.25)",
              color: "white",
              cursor: "pointer",
            }}
          >
            ›
          </button>

          {/* dots */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 12,
              transform: "translateX(-50%)",
              zIndex: 3,
              display: "flex",
              gap: 8,
            }}
          >
            {safeSlides.map((_, i) => (
              <div
                key={i}
                onMouseDown={(e) => enabled && e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx(i);
                }}
                style={{
                  width: i === idx ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: i === idx ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.45)",
                  cursor: "pointer",
                  transition: "all .2s ease",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SliderSettings = () => {
  const {
    actions: { setProp },
    slides,
    height,
    overlay,
    autoPlay,
    intervalMs,
    contentAlign,
    maxContentWidth,
    paddingX,
    paddingY,
    titleColor,
    subtitleColor,
  } = useNode((node) => ({
    slides: node.data.props.slides,
    height: node.data.props.height,
    overlay: node.data.props.overlay,
    autoPlay: node.data.props.autoPlay,
    intervalMs: node.data.props.intervalMs,
    contentAlign: node.data.props.contentAlign,
    maxContentWidth: node.data.props.maxContentWidth,
    paddingX: node.data.props.paddingX,
    paddingY: node.data.props.paddingY,
    titleColor: node.data.props.titleColor,
    subtitleColor: node.data.props.subtitleColor,
  }));

  const updateSlide = (idx: number, key: keyof SlideItem, value: string) => {
    setProp((p: any) => {
      const next = [...(p.slides || [])];
      next[idx] = { ...(next[idx] || {}), [key]: value };
      p.slides = next;
    });
  };

  const addSlide = () => {
    setProp((p: any) => {
      p.slides = [
        ...(p.slides || []),
        {
          image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80",
          title: "New slide",
          subtitle: "Edit me in settings",
          ctaText: "Learn more",
          ctaHref: "#",
        },
      ];
    });
  };

  const removeSlide = (idx: number) => {
    setProp((p: any) => {
      p.slides = (p.slides || []).filter((_: any, i: number) => i !== idx);
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Input label="Height" size="sm" variant="bordered" value={height || "420px"} onChange={(e) => setProp((p: any) => (p.height = e.target.value))} />
        <Input label="Overlay (rgba)" size="sm" variant="bordered" value={overlay || "rgba(0,0,0,.45)"} onChange={(e) => setProp((p: any) => (p.overlay = e.target.value))} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!autoPlay}
            onChange={(e) => setProp((p: any) => (p.autoPlay = e.target.checked))}
          />
          Auto play
        </label>

        <Input
          label="Interval (ms)"
          size="sm"
          variant="bordered"
          value={intervalMs || 4000}
          onChange={(e) => setProp((p: any) => (p.intervalMs = Number(e.target.value || 4000)))}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          className="w-full bg-zinc-800 border border-white/10 rounded text-xs p-2 text-white"
          value={contentAlign || "left"}
          onChange={(e) => setProp((p: any) => (p.contentAlign = e.target.value))}
        >
          <option value="left">Content Left</option>
          <option value="center">Content Center</option>
        </select>

        <Input
          label="Max content width"
          size="sm"
          variant="bordered"
          value={maxContentWidth || "1200px"}
          onChange={(e) => setProp((p: any) => (p.maxContentWidth = e.target.value))}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input label="Padding X" size="sm" variant="bordered" value={paddingX ?? 24} onChange={(e) => setProp((p: any) => (p.paddingX = Number(e.target.value || 0)))} />
        <Input label="Padding Y" size="sm" variant="bordered" value={paddingY ?? 48} onChange={(e) => setProp((p: any) => (p.paddingY = Number(e.target.value || 0)))} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input label="Title color" size="sm" variant="bordered" value={titleColor || "rgba(255,255,255,.95)"} onChange={(e) => setProp((p: any) => (p.titleColor = e.target.value))} />
        <Input label="Subtitle color" size="sm" variant="bordered" value={subtitleColor || "rgba(255,255,255,.75)"} onChange={(e) => setProp((p: any) => (p.subtitleColor = e.target.value))} />
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs opacity-70">Slides</div>
          <button type="button" className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-xs" onClick={addSlide}>
            + Add
          </button>
        </div>

        <div className="space-y-2 mt-2">
          {(slides || []).map((s: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-xs opacity-70">#{idx}</div>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10"
                  onClick={() => removeSlide(idx)}
                >
                  Remove
                </button>
              </div>

              <Input label="Image" size="sm" variant="bordered" value={s.image || ""} onChange={(e) => updateSlide(idx, "image", e.target.value)} />
              <Input label="Title" size="sm" variant="bordered" value={s.title || ""} onChange={(e) => updateSlide(idx, "title", e.target.value)} />
              <Input label="Subtitle" size="sm" variant="bordered" value={s.subtitle || ""} onChange={(e) => updateSlide(idx, "subtitle", e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="CTA Text" size="sm" variant="bordered" value={s.ctaText || ""} onChange={(e) => updateSlide(idx, "ctaText", e.target.value)} />
                <Input label="CTA Href" size="sm" variant="bordered" value={s.ctaHref || ""} onChange={(e) => updateSlide(idx, "ctaHref", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

(SliderComponent as any).craft = {
  displayName: "Slider",
  props: {
    slides: [
      {
        image:
          "https://images.unsplash.com/photo-1520975693411-35a7c4f4b3ea?auto=format&fit=crop&w=2000&q=80",
        title: "Build faster with MimicPC",
        subtitle: "GPU-ready AI workflows for images, video, and audio.",
        ctaText: "Free Launch",
        ctaHref: "https://example.com",
      },
      {
        image:
          "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=2000&q=80",
        title: "Private & Secure",
        subtitle: "Run your models with fast, isolated compute.",
        ctaText: "View Docs",
        ctaHref: "#docs",
      },
    ],
    height: "420px",
    overlay: "rgba(0,0,0,.45)",
    autoPlay: true,
    intervalMs: 4000,
    contentAlign: "left",
    maxContentWidth: "1200px",
    paddingX: 24,
    paddingY: 48,
    titleColor: "rgba(255,255,255,.95)",
    subtitleColor: "rgba(255,255,255,.75)",
  },
  related: {
    settings: SliderSettings,
  },
};
