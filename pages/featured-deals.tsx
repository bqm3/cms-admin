import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/FeaturedDealManagementPage").then((m) => m.FeaturedDealManagementPage), { ssr: false });
