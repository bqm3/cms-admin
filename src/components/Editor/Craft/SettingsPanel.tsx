import React from "react";
import { useEditor } from "@craftjs/core";
import { Chip } from "@heroui/chip";

export const SettingsPanel = () => {
  const { selected, actions } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.displayName,
        settings:
          state.nodes[currentNodeId].related &&
          state.nodes[currentNodeId].related.settings,
      };
    }

    return {
      selected,
    };
  });

  return selected ? (
    <div className="p-4 border-t border-white/10 mt-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white font-semibold">Settings</span>
        <Chip color="primary" size="sm">
          {selected.name}
        </Chip>
      </div>
      {selected.settings && React.createElement(selected.settings)}

      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          className="w-full py-2 px-4 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors text-sm"
          onClick={() => actions.delete(selected.id)}
        >
          Delete Component
        </button>
      </div>
    </div>
  ) : (
    <div className="p-4 border-t border-white/10 mt-4">
      <p className="text-zinc-500 text-sm text-center">
        Select a component to edit settings
      </p>
    </div>
  );
};
