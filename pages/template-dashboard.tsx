import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/TemplateDashboardPage").then((m) => m.TemplateDashboardPage), { ssr: false });
