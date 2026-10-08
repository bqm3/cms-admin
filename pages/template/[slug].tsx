import dynamic from "next/dynamic";

export default dynamic(() => import("../../src/pages/PublicTemplatePage").then((m) => m.PublicTemplatePage), { ssr: false });
