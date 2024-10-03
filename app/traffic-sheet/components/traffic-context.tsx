"use client";

import {
  SelectBuses,
  SelectDrivers,
  SelectCities,
  SelectRepresentatives,
} from "@/drizzle/schema";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface TrafficContextType {
  buses: SelectBuses[];
  drivers: SelectDrivers[];
  cities: SelectCities[];
  representatives: SelectRepresentatives[];
}

const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

export function TrafficProvider({
  buses,
  drivers,
  cities,
  representatives,
  children,
}: {
  buses: SelectBuses[];
  drivers: SelectDrivers[];
  cities: SelectCities[];
  representatives: SelectRepresentatives[];
  children: ReactNode;
}) {
  const value = {
    buses,
    drivers,
    cities,
    representatives,
  };

  return (
    <TrafficContext.Provider value={value}>{children}</TrafficContext.Provider>
  );
}

export function useTraffic() {
  const context = useContext(TrafficContext);
  if (context === undefined) {
    throw new Error("useTraffic must be used within a TrafficProvider");
  }
  return context;
}
