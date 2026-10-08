import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/CategoryManagementPage").then((m) => m.CategoryManagementPage), { ssr: false });
