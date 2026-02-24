import React from "react";
import { useNode } from "@craftjs/core";

export const ScriptComponentSettings = () => {
  const { actions, props } = useNode((node) => ({
    props: node.data.props as any,
  }));

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-bold text-zinc-400">Bật script</label>
      <input
        type="checkbox"
        checked={!!props.enabled}
        onChange={(e) =>
          actions.setProp((p: any) => (p.enabled = e.target.checked))
        }
      />

      <label className="text-xs font-bold text-zinc-400">Chạy trong Editor</label>
      <input
        type="checkbox"
        checked={!!props.runInEditor}
        onChange={(e) =>
          actions.setProp((p: any) => (p.runInEditor = e.target.checked))
        }
      />

      <label className="text-xs font-bold text-zinc-400">Vị trí inject</label>
      <select
        className="h-9 rounded-lg bg-zinc-900/60 border border-white/10 text-zinc-200 px-2 text-sm"
        value={props.location || "head"}
        onChange={(e) => actions.setProp((p: any) => (p.location = e.target.value))}
      >
        <option value="head">head</option>
        <option value="body-end">body (cuối)</option>
      </select>

      <label className="text-xs font-bold text-zinc-400">Mode</label>
      <select
        className="h-9 rounded-lg bg-zinc-900/60 border border-white/10 text-zinc-200 px-2 text-sm"
        value={props.mode || "script"}
        onChange={(e) => actions.setProp((p: any) => (p.mode = e.target.value))}
      >
        <option value="script">script</option>
        <option value="json-ld">json-ld</option>
      </select>

      <label className="text-xs font-bold text-zinc-400">ID (tránh trùng)</label>
      <input
        className="h-9 rounded-lg bg-zinc-900/60 border border-white/10 text-zinc-200 px-2 text-sm"
        value={props.id || ""}
        onChange={(e) => actions.setProp((p: any) => (p.id = e.target.value))}
        placeholder="vd: gtm-head, schema-home..."
      />

      <label className="text-xs font-bold text-zinc-400">Script code</label>
      <textarea
        className="w-full h-56 rounded-lg bg-zinc-900/60 border border-white/10 text-zinc-200 p-2 text-sm"
        value={props.code || ""}
        onChange={(e) => actions.setProp((p: any) => (p.code = e.target.value))}
        placeholder={
          props.mode === "json-ld"
            ? '{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "Global Promotion"\n}'
            : "/* paste GTM/GA/Pixel script here */"
        }
      />
      <div className="text-[11px] text-zinc-500">
        Tip: JSON-LD phải là JSON hợp lệ. Script thường là JS inline.
      </div>
    </div>
  );
};