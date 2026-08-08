/* eslint-disable react/no-danger */
import React, { useEffect, useMemo, useRef } from "react";
import { useEditor, useNode } from "@craftjs/core";

type Props = {
  enabled?: boolean;
  location?: "head" | "body-end";
  mode?: "script" | "json-ld";
  id?: string;
  code?: string;
  runInEditor?: boolean;
};

function isEditorRoute() {
  if (typeof window === "undefined") return false;
  return (
    window.location.pathname.startsWith("/editor") ||
    window.location.pathname.startsWith("/dashboard")
  );
}

export const ScriptComponent = ({
  enabled = true,
  location = "head",
  mode = "script",
  id = "seo-script",
  code = "",
  runInEditor = false,
}: Props) => {
  const { enabled: editorEnabled } = useEditor((s) => ({ enabled: s.options.enabled }));
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const markerId = useMemo(() => `craft-script-${id}`, [id]);
  const injectedElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const inEditor = editorEnabled || isEditorRoute();
    if (inEditor && !runInEditor) return;

    const trimmed = (code || "").trim();
    if (!trimmed) return;

    // remove old
    const old = document.getElementById(markerId);
    if (old?.parentNode) old.parentNode.removeChild(old);

    let el: HTMLElement;

    if (mode === "json-ld") {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = markerId;
      // Trích xuất nội dung nếu user lỡ nhập <script>...</script>
      let jsonContent = trimmed;
      if (jsonContent.startsWith("<script") && jsonContent.endsWith("</script>")) {
        jsonContent = jsonContent.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
      }
      s.text = jsonContent;
      el = s;
    } else {
      // Nếu user nhập code chứa thẻ HTML như <script>...</script> hoặc các thẻ khác
      if (trimmed.toLowerCase().includes("<script") || trimmed.startsWith("<")) {
        // Tạo container tạm thời để parse HTML string
        const container = document.createElement("div");
        container.innerHTML = trimmed;
        
        // Nếu có script tag bên trong, lấy script tag đầu tiên hoặc tạo fragment
        const scriptEl = container.querySelector("script");
        if (scriptEl) {
          const s = document.createElement("script");
          s.id = markerId;
          Array.from(scriptEl.attributes).forEach(attr => {
            s.setAttribute(attr.name, attr.value);
          });
          s.text = scriptEl.text || scriptEl.textContent || "";
          el = s;
        } else {
          // Nếu không phải script tag, tạo span/div bọc lại
          const wrapper = document.createElement("div");
          wrapper.id = markerId;
          wrapper.innerHTML = trimmed;
          el = wrapper;
        }
      } else {
        const s = document.createElement("script");
        s.type = "text/javascript";
        s.id = markerId;
        s.text = trimmed;
        el = s;
      }
    }

    const target = location === "head" ? document.head : document.body;
    target.appendChild(el);
    injectedElRef.current = el;

    return () => {
      const cur = document.getElementById(markerId) || injectedElRef.current;
      if (cur?.parentNode) cur.parentNode.removeChild(cur);
      injectedElRef.current = null;
    };
  }, [enabled, location, mode, markerId, code, runInEditor, editorEnabled]);

  // ✅ Trong editor: hiện placeholder có thể click/kéo được
  if (editorEnabled || isEditorRoute()) {
    const hasCode = (code || "").trim().length > 0;
    const lineCount = (code || "").trim().split("\n").length;

    return (
      <div
        ref={(ref) => ref && connect(drag(ref))}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 12px",
          margin: "4px 0",
          borderRadius: 8,
          border: selected
            ? "1.5px solid #6366f1"
            : `1.5px dashed ${enabled ? "#3f3f46" : "#27272a"}`,
          background: selected
            ? "rgba(99,102,241,0.08)"
            : enabled
            ? "rgba(33,41,74,0.18)"
            : "rgba(39,39,42,0.4)",
          cursor: "grab",
          userSelect: "none",
          transition: "all 0.15s ease",
          opacity: enabled ? 1 : 0.5,
          minHeight: 40,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: enabled ? "rgba(99,102,241,0.15)" : "rgba(63,63,70,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 13,
            color: enabled ? "#818cf8" : "#52525b",
            fontWeight: 700,
            fontFamily: "monospace",
          }}
        >
          {"</>"}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: selected ? "#a5b4fc" : "#a1a1aa",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1,
              marginBottom: 3,
            }}
          >
            Script — {id || "unnamed"}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#52525b",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {mode === "json-ld" ? "JSON-LD" : "JS"} · {location === "head" ? "head" : "body"}{" "}
            {hasCode ? `· ${lineCount} dòng` : "· (chưa có code)"}
          </div>
        </div>

        {/* Status badge */}
        <div
          style={{
            flexShrink: 0,
            padding: "2px 7px",
            borderRadius: 99,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            background: enabled ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
            color: enabled ? "#34d399" : "#f87171",
            border: enabled ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {enabled ? "ON" : "OFF"}
        </div>
      </div>
    );
  }

  // ✅ Ngoài editor: invisible hoàn toàn
  return null;
};

import { ScriptComponentSettings } from "./ScriptComponentSettings";

ScriptComponent.craft = {
  displayName: "Script",
  props: {
    enabled: true,
    location: "head",
    mode: "script",
    id: "seo-script",
    code: "",
    runInEditor: false,
  },
  related: {
    settings: ScriptComponentSettings,
  },
  rules: {
    canDrag: () => true,
  },
};