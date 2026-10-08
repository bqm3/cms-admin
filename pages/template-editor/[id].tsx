import dynamic from "next/dynamic";

export default dynamic(() => import("../../src/components/Editor/TemplateEditorPage").then((m) => m.TemplateEditorPage), { ssr: false });
