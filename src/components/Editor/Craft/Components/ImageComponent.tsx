import { useNode } from "@craftjs/core";
import { Input } from "@heroui/input";

interface ImageProps {
  src?: string;
  width?: string;
  height?: string;          // ✅ NEW
  alt?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"; // ✅ NEW (optional)
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";              // ✅ NEW (optional)
}

const radiusClassMap: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

export const ImageComponent = ({
  src = "https://via.placeholder.com/150",
  width = "100%",
  height = "auto",          // ✅ NEW
  alt = "Image",
  objectFit = "cover",      // ✅ NEW
  radius = "lg",            // ✅ NEW
}: ImageProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const wrapStyle: React.CSSProperties = { width };
  // height áp vào img (và giữ responsive khi auto)
  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: height === "auto" ? "auto" : height,
    objectFit,
  };

  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      className={`relative inline-block ${selected ? "ring-2 ring-purple-500" : ""}`}
      style={wrapStyle}
    >
      <img
        alt={alt}
        src={src}
        style={imgStyle}
        className={`${radiusClassMap[radius] || "rounded-lg"} shadow-sm`}
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
    height,     // ✅ NEW
    objectFit,  // ✅ NEW
    radius,     // ✅ NEW
  } = useNode((node) => ({
    src: node.data.props.src,
    width: node.data.props.width,
    height: node.data.props.height,
    objectFit: node.data.props.objectFit,
    radius: node.data.props.radius,
  }));

  return (
    <div className="space-y-3">
      <Input
        label="Image URL"
        size="sm"
        value={src}
        variant="bordered"
        onChange={(e) => setProp((props: any) => (props.src = e.target.value))}
      />

      <Input
        label="Width (e.g. 100%, 420px)"
        size="sm"
        value={width || "100%"}
        variant="bordered"
        onChange={(e) => setProp((props: any) => (props.width = e.target.value))}
      />

      <Input
        label="Height (e.g. auto, 320px)"
        size="sm"
        value={height || "auto"}
        variant="bordered"
        onChange={(e) => setProp((props: any) => (props.height = e.target.value))}
      />

      <div>
        <label className="text-xs text-zinc-400">Object fit</label>
        <select
          className="w-full bg-zinc-800 border border-white/10 rounded text-xs p-2 text-white"
          value={objectFit || "cover"}
          onChange={(e) => setProp((props: any) => (props.objectFit = e.target.value))}
        >
          {["cover", "contain", "fill", "none", "scale-down"].map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-zinc-400">Radius</label>
        <select
          className="w-full bg-zinc-800 border border-white/10 rounded text-xs p-2 text-white"
          value={radius || "lg"}
          onChange={(e) => setProp((props: any) => (props.radius = e.target.value))}
        >
          {["none", "sm", "md", "lg", "xl", "2xl"].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

ImageComponent.craft = {
  displayName: "Image",
  props: {
    src: "https://via.placeholder.com/300x200",
    width: "100%",
    height: "auto",     // ✅ NEW
    alt: "Placeholder Image",
    objectFit: "cover", // ✅ NEW
    radius: "lg",       // ✅ NEW
  },
  related: {
    settings: ImageSettings,
  },
};
