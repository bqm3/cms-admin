import dynamic from "next/dynamic";

export default dynamic(() => import("../../src/components/Editor/EditorPage").then((m) => m.EditorPage), { ssr: false });
