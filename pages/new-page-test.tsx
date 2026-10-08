import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/NewPage").then((m) => m.NewPage), { ssr: false });
