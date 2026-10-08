import React, { createContext, useContext } from "react";

type PublicData = {
  categories?: any[];
  parentCategories?: any[];
};

const PublicDataInitialContext = createContext<PublicData>({});

export function PublicDataInitialProvider({
  value,
  children,
}: {
  value?: PublicData;
  children: React.ReactNode;
}) {
  return (
    <PublicDataInitialContext.Provider value={value || {}}>
      {children}
    </PublicDataInitialContext.Provider>
  );
}

export function useInitialPublicData() {
  return useContext(PublicDataInitialContext);
}
