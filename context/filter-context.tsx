"use client";

import { createContext, useState, useContext, ReactNode } from "react";

interface FilterContextType {
  filter: Filters | undefined;
  setFilter: (filter: Filters | undefined) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
  initFilter?: Filters;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({
  children,
  initFilter,
}) => {
  const [filter, setFilter] = useState<Filters | undefined>(initFilter);

  const value = {
    filter,
    setFilter,
  };
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};
