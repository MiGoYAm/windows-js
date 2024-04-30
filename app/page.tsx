"use client";

import { windowAtomsAtom } from "@/components/App";
import Dock from "@/components/Dock";
import { useWindowSize } from "@/lib/hooks";
import { AnimatePresence } from "framer-motion";
import { useAtomValue } from "jotai";
import React from "react";
import Window from "@/components/App"

export default function Home() {
  useWindowSize();

  return (
    <main className="relative h-screen w-screen overflow-clip dark:bg-black">
      <Desktop />
      <Dock />
    </main>
  );
}

function Desktop() {
  const windowAtoms = useAtomValue(windowAtomsAtom);

  return (
    <AnimatePresence>
      {windowAtoms.map((windowAtom) => (
        <WindowMemo state={windowAtom} key={`${windowAtom}`} />
      ))}
    </AnimatePresence>
  );
}

const WindowMemo = React.memo(Window);
