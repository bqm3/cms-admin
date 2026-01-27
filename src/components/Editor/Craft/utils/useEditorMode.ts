import { useEditor } from "@craftjs/core";

export function useEditorMode() {
  return useEditor((state) => ({
    enabled: state.options.enabled,
  })).enabled;
}
