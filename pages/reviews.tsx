import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/ReviewManagementPage").then((m) => m.ReviewManagementPage), { ssr: false });
