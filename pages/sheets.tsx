import dynamic from "next/dynamic";

export default dynamic(() => import("../src/pages/SheetsRowsPage").then((m) => m.SheetsRowsPage), { ssr: false });
