import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/MediaManagementPage").then((m) => m.MediaManagementPage), { ssr: false });
