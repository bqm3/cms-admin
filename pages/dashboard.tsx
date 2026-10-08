import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/DashboardPage").then((m) => m.DashboardPage), { ssr: false });
