/* eslint-disable prettier/prettier */
import { useNode } from "@craftjs/core";

export interface SpacerProps {
  size: number; // px
  direction: "vertical" | "horizontal";
}

export const SpacerComponent = ({
  size = 24,
  direction = "vertical",
}: SpacerProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        width: direction === "horizontal" ? size : "100%",
        height: direction === "vertical" ? size : "100%",
        minWidth: direction === "horizontal" ? size : undefined,
        minHeight: direction === "vertical" ? size : undefined,
        boxSizing: "border-box",
        outline: selected ? "1px dashed rgba(255,255,255,.25)" : "none",
        outlineOffset: 4,
        pointerEvents: "auto",
      }}
    />
  );
};


const SpacerSettings = () => {
  const {
    size,
    direction,
    actions: { setProp },
  } = useNode((node) => ({
    size: node.data.props.size,
    direction: node.data.props.direction,
  }));

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs opacity-70 mb-1">Direction</div>
        <select
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={direction}
          onChange={(e) =>
            setProp((p: any) => (p.direction = e.target.value))
          }
        >
          <option value="vertical">Vertical (Y)</option>
          <option value="horizontal">Horizontal (X)</option>
        </select>
      </div>

      <div>
        <div className="text-xs opacity-70 mb-1">Size (px)</div>
        <input
          type="number"
          min={0}
          max={400}
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-sm"
          value={size}
          onChange={(e) =>
            setProp((p: any) => (p.size = Number(e.target.value)))
          }
        />
      </div>

      {/* Quick presets */}
      <div className="flex gap-2 pt-1">
        {[8, 16, 24, 32, 48, 64].map((v) => (
          <button
            key={v}
            className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10"
            onClick={() => setProp((p: any) => (p.size = v))}
          >
            {v}px
          </button>
        ))}
      </div>
    </div>
  );
};


(SpacerComponent as any).craft = {
  displayName: "Spacer",
  props: {
    size: 24,
    direction: "vertical",
  },
  related: {
    settings: SpacerSettings,
  },
};
