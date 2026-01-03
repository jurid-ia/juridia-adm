"use client";

import { Toaster } from "react-hot-toast";
import { ApiContextProvider } from "./ApiContext";
import { SampleContextProvider } from "./SampleContext";

export function ContextProviders({ children }: { children: React.ReactNode }) {
  return (
    <ApiContextProvider>
      <SampleContextProvider>
        <Toaster position="bottom-center" />
        {children}
      </SampleContextProvider>
    </ApiContextProvider>
  );
}
