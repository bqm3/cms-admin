import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/FooterManagementPage").then((m) => m.FooterManagementPage), { ssr: false });
