/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEditor, useNode } from "@craftjs/core";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";


export const ButtonComponent = ({
  text,
  color,
  variant,
  size,
  radius,
  fullWidth,
  href,
  openInNewTab,
}: any) => {
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const handleLinkClick = (e: React.MouseEvent) => {
    // ✅ Khi đang edit: chặn navigate
    if (enabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const buttonEl = (
    <Button
      className={selected ? "ring-2 ring-blue-500" : ""}
      color={color}
      fullWidth={fullWidth}
      radius={radius}
      size={size}
      variant={variant}
      // ✅ chặn cả onPress khi enabled
      onPress={() => {}}
    >
      {text}
    </Button>
  );

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="inline-block m-1"
      style={{ width: fullWidth ? "100%" : "auto" }}
    >
      {href ? (
        <a
          className="inline-block"
          href={href}
          target={openInNewTab ? "_blank" : "_self"}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          onClick={handleLinkClick}
          onMouseDown={(e) => enabled && e.preventDefault()} // ✅ tránh mất selection
        >
          {buttonEl}
        </a>
      ) : (
        buttonEl
      )}
    </div>
  );
};


export const ButtonSettings = () => {
  const {
    text,
    color,
    variant,
    size,
    radius,
    fullWidth,
    href,
    openInNewTab,
    actions: { setProp },
  } = useNode((node) => ({
    text: node.data.props.text,
    color: node.data.props.color,
    variant: node.data.props.variant,
    size: node.data.props.size,
    radius: node.data.props.radius,
    fullWidth: node.data.props.fullWidth,
    href: node.data.props.href,
    openInNewTab: node.data.props.openInNewTab,
  }));

  return (
    <div className="space-y-4">
      <Input
        label="Label"
        size="sm"
        value={text}
        variant="bordered"
        onChange={(e) => setProp((props: any) => (props.text = e.target.value))}
      />

      {/* LINK */}
      <Input
        label="Link (URL)"
        placeholder="https://example.com"
        size="sm"
        value={href || ""}
        variant="bordered"
        onChange={(e) => setProp((props: any) => (props.href = e.target.value))}
      />

      <div className="flex items-center gap-2">
        <input
          checked={openInNewTab}
          className="accent-purple-500"
          type="checkbox"
          onChange={(e) =>
            setProp((props: any) => (props.openInNewTab = e.target.checked))
          }
        />
        <label className="text-xs text-zinc-400">Open in new tab</label>
      </div>

      {/* STYLE */}
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Style</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-500 block">Color</label>
            <select
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-1 text-white"
              value={color}
              onChange={(e) =>
                setProp((props: any) => (props.color = e.target.value))
              }
            >
              {[
                "default",
                "primary",
                "secondary",
                "success",
                "warning",
                "danger",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 block">Variant</label>
            <select
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-1 text-white"
              value={variant}
              onChange={(e) =>
                setProp((props: any) => (props.variant = e.target.value))
              }
            >
              {[
                "solid",
                "bordered",
                "light",
                "flat",
                "faded",
                "shadow",
                "ghost",
              ].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Size & Shape</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-zinc-500 block">Size</label>
            <div className="flex bg-zinc-800 rounded p-1 gap-1">
              {["sm", "md", "lg"].map((s) => (
                <button
                  key={s}
                  className={`flex-1 p-1 text-[10px] rounded uppercase ${
                    size === s
                      ? "bg-purple-600 text-white"
                      : "hover:bg-zinc-700"
                  }`}
                  onClick={() => setProp((props: any) => (props.size = s))}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 block">Radius</label>
            <select
              className="w-full bg-zinc-800 border-white/10 rounded text-xs p-1 text-white"
              value={radius}
              onChange={(e) =>
                setProp((props: any) => (props.radius = e.target.value))
              }
            >
              {["none", "sm", "md", "lg", "full"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          checked={fullWidth}
          className="accent-purple-500"
          type="checkbox"
          onChange={(e) =>
            setProp((props: any) => (props.fullWidth = e.target.checked))
          }
        />
        <label className="text-xs text-zinc-400">Full Width</label>
      </div>
    </div>
  );
};

ButtonComponent.craft = {
  displayName: "Button",
  props: {
    text: "Click Me",
    color: "primary",
    variant: "solid",
    size: "md",
    radius: "md",
    fullWidth: false,
    href: "",
    openInNewTab: true,
  },
  related: {
    settings: ButtonSettings,
  },
};
