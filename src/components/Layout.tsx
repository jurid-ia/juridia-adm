"use client";

import LeftSidebar from "@/components/LeftSidebar";
import { useState } from "react";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [visibleSidebar, setVisibleSidebar] = useState<boolean>(false);

  return (
    <div
      className={`bg-n-2 dark:bg-n-6 min-h-screen transition-all duration-300 ${
        visibleSidebar ? "pl-24" : "pl-80"
      }`}
    >
      <LeftSidebar value={visibleSidebar} setValue={setVisibleSidebar} />

      <div
        className={`bg-n-2 dark:bg-n-6 flex min-h-screen px-4 py-6 transition-all duration-300`}
      >
        <div
          className={`bg-n-1 dark:bg-n-8 relative flex max-w-full grow rounded-[1.25rem] p-6 md:rounded-lg`}
        >
          <div className={`relative flex h-full w-full flex-col`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
