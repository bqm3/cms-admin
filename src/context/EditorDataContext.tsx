import React, { createContext, useContext, useMemo, useState } from "react";
import dummyJson from "../data/dummyJson.json";

type EditorData = typeof dummyJson;

const EditorDataContext = createContext<{
  data: EditorData;
  setData: (d: EditorData) => void;
}>({ data: dummyJson, setData: () => {} });

export const useEditorData = () => useContext(EditorDataContext);

export const EditorDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<EditorData>(dummyJson);

  const value = useMemo(() => ({ data, setData }), [data]);

  return <EditorDataContext.Provider value={value}>{children}</EditorDataContext.Provider>;
};

export default EditorDataContext;
