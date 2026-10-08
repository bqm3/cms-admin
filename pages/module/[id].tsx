import dynamic from "next/dynamic";

export default dynamic(() => import("../../src/components/Editor/ModuleEditorPage").then((m) => m.ModuleEditorPage), { ssr: false });
