import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/UserManagementPage").then((m) => m.UserManagementPage), { ssr: false });
