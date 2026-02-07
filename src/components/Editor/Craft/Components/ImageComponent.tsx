/* eslint-disable prettier/prettier */
import React, { useMemo } from "react";
import { useNode } from "@craftjs/core";
import { Input } from "@heroui/input";

interface ImageProps {
  src?: string;
  width?: string;
  height?: string;

  // user override
  alt?: string;

  // ✅ default alt (từ title bài)
  defaultAlt?: string;

  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const radiusClassMap: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

/**
 * ✅ Placeholder nội bộ (không phụ thuộc mạng/DNS)
 * - Dùng SVG data URI: luôn load được
 */
function svgPlaceholder(text = "No image", w = 1200, h = 800) {
  const t = encodeURIComponent(text);
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0f172a"/>
        <stop offset="1" stop-color="#18181b"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="48" y="48" width="${w - 96}" height="${h - 96}" rx="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          fill="rgba(255,255,255,0.65)" font-family="Arial, sans-serif"
          font-size="48" font-weight="700">
      ${t}
    </text>
    <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle"
          fill="rgba(255,255,255,0.35)" font-family="Arial, sans-serif"
          font-size="26">
      Paste an image URL in settings
    </text>
  </svg>
  `.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const FALLBACK_SRC = svgPlaceholder("Image");

export const ImageComponent = ({
  src = FALLBACK_SRC,
  width = "100%",
  height = "auto",
  alt = "",
  defaultAlt = "",
  objectFit = "cover",
  radius = "lg",
}: ImageProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const wrapStyle: React.CSSProperties = { width };

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: height === "auto" ? "auto" : height,
    objectFit,
  };

  // ✅ alt hiển thị: ưu tiên alt user, nếu rỗng thì dùng defaultAlt (title)
  const computedAlt = useMemo(() => {
    return (alt || "").trim() || (defaultAlt || "").trim() || "";
  }, [alt, defaultAlt]);

  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      className={`relative inline-block ${selected ? "ring-2 ring-purple-500" : ""}`}
      style={wrapStyle}
    >
      <img
        alt={computedAlt}
        src={src || FALLBACK_SRC}
        style={imgStyle}
        loading="lazy"
        decoding="async"
        className={`${radiusClassMap[radius] || "rounded-lg"} shadow-sm`}
        onError={(e) => {
          // ✅ Tránh loop: chỉ fallback 1 lần
          const img = e.currentTarget;
          if (img.dataset.fallbackApplied === "1") return;

          img.dataset.fallbackApplied = "1";
          img.src = FALLBACK_SRC;
        }}
      />

      {selected && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Image
        </div>
      )}
    </div>
  );
};

const ImageSettings = () => {
  const {
    actions: { setProp },
    src,
    width,
    height,
    alt,
    defaultAlt,
    objectFit,
    radius,
  } = useNode((node) => ({
    src: node.data.props.src,
    width: node.data.props.width,
    height: node.data.props.height,
    alt: node.data.props.alt,
    defaultAlt: node.data.props.defaultAlt,
    objectFit: node.data.props.objectFit,
    radius: node.data.props.radius,
  }));

  // ✅ UI hiển thị alt: nếu user chưa nhập thì show defaultAlt
  const displayAlt = (alt || "").trim() || (defaultAlt || "").trim() || "";

  return (
    <div className="space-y-3">
      <Input
        label="Image URL"
        size="sm"
        value={src || ""}
        variant="bordered"
        placeholder="https://... hoặc để trống sẽ dùng placeholder"
        onChange={(e) =>
          setProp((props: any) => {
            props.src = e.target.value;
          })
        }
      />

      <Input
        label="Alt text (SEO & accessibility)"
        size="sm"
        value={displayAlt}
        variant="bordered"
        placeholder="Mô tả nội dung hình ảnh"
        onChange={(e) =>
          setProp((props: any) => {
            // ✅ khi user nhập -> alt chính thức
            props.alt = e.target.value;
          })
        }
      />

      {/* ✅ optional: nút reset alt về mặc định (title) */}
      <button
        type="button"
        className="w-full text-xs font-bold h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300"
        onClick={() =>
          setProp((props: any) => {
            props.alt = "";
          })
        }
        title="Reset alt về Title"
      >
        Reset alt về Title
      </button>

      <Input
        label="Width (e.g. 100%, 420px)"
        size="sm"
        value={width || "100%"}
        variant="bordered"
        onChange={(e) =>
          setProp((props: any) => {
            props.width = e.target.value;
          })
        }
      />

      <Input
        label="Height (e.g. auto, 320px)"
        size="sm"
        value={height || "auto"}
        variant="bordered"
        onChange={(e) =>
          setProp((props: any) => {
            props.height = e.target.value;
          })
        }
      />

      <div>
        <label className="text-xs text-zinc-400">Object fit</label>
        <select
          className="w-full bg-zinc-800 border border-white/10 rounded text-xs p-2 text-white"
          value={objectFit || "cover"}
          onChange={(e) =>
            setProp((props: any) => {
              props.objectFit = e.target.value;
            })
          }
        >
          {["cover", "contain", "fill", "none", "scale-down"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-zinc-400">Radius</label>
        <select
          className="w-full bg-zinc-800 border border-white/10 rounded text-xs p-2 text-white"
          value={radius || "lg"}
          onChange={(e) =>
            setProp((props: any) => {
              props.radius = e.target.value;
            })
          }
        >
          {["none", "sm", "md", "lg", "xl", "2xl"].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

ImageComponent.craft = {
  displayName: "Image",
  props: {
    // ✅ Không dùng via.placeholder nữa để tránh DNS lỗi
    src: FALLBACK_SRC,
    width: "100%",
    height: "auto",
    alt: "",

    // ✅ NEW: default alt từ title
    defaultAlt: "",

    objectFit: "cover",
    radius: "lg",
  },
  related: {
    settings: ImageSettings,
  },
};
