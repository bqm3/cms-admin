import { useNode } from "@craftjs/core";
import { Input } from "@heroui/input";

interface ImageProps {
  src?: string;
  width?: string;
  alt?: string;
}

export const ImageComponent = ({
  src = "https://via.placeholder.com/150",
  width = "100%",
  alt = "Image",
}: ImageProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref: any) => connect(drag(ref))}
      className={`relative inline-block ${selected ? "ring-2 ring-purple-500" : ""}`}
      style={{ width }}
    >
      <img alt={alt} className="w-full h-auto rounded-lg shadow-sm" src={src} />
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
  } = useNode((node) => ({
    src: node.data.props.src,
    width: node.data.props.width,
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
      <div>
        <label className="text-xs text-zinc-400">Width</label>
        <div className="flex gap-2">
          <div
            className={`w-8 h-8 flex items-center justify-center border rounded cursor-pointer ${width === "100%" ? "bg-purple-500 text-white border-purple-500" : "border-zinc-700 hover:bg-zinc-800"}`}
            onClick={() => setProp((props: any) => (props.width = "100%"))}
          >
            Full
          </div>
          <div
            className={`w-8 h-8 flex items-center justify-center border rounded cursor-pointer ${width === "50%" ? "bg-purple-500 text-white border-purple-500" : "border-zinc-700 hover:bg-zinc-800"}`}
            onClick={() => setProp((props: any) => (props.width = "50%"))}
          >
            1/2
          </div>
          <div
            className={`w-8 h-8 flex items-center justify-center border rounded cursor-pointer ${width === "25%" ? "bg-purple-500 text-white border-purple-500" : "border-zinc-700 hover:bg-zinc-800"}`}
            onClick={() => setProp((props: any) => (props.width = "25%"))}
          >
            1/4
          </div>
        </div>
      </div>
    </div>
  );
};

ImageComponent.craft = {
  displayName: "Image",
  props: {
    src: "https://via.placeholder.com/300x200",
    width: "100%",
    alt: "Placeholder Image",
  },
  related: {
    settings: ImageSettings,
  },
};
