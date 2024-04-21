"use client";

import Dock, { windowsAtom } from "@/components/Dock";
import { atom, useAtomValue } from "jotai";
import React from "react";

export default function Home() {
  const windows = useAtomValue(windowsAtom);

  return (
    <main className="relative h-screen w-screen overflow-clip dark:bg-black">
      {windows.map((window, index) =>
        React.createElement(window, { key: window.name + index }),
      )}
      <Dock />
    </main>
  );
}
