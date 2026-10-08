import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/ParentCategoryManagementPage").then((m) => m.ParentCategoryManagementPage), { ssr: false });
