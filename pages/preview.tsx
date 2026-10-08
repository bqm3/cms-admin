import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/PreviewPage").then((m) => m.PreviewPage), { ssr: false });
