import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/BannerManagementPage").then((m) => m.BannerManagementPage), { ssr: false });
