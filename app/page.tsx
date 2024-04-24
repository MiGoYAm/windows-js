"use client";

import { AppWindow, windowAtomsAtom } from "@/components/App";
import Dock from "@/components/Dock";
import { useWindowSize } from "@/components/hooks";
import { AnimatePresence } from "framer-motion";
import { PrimitiveAtom, useAtomValue } from "jotai";
import React, { useEffect } from "react";

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
        <WindowWrapper state={windowAtom} key={`${windowAtom}`} />
      ))}
    </AnimatePresence>
  );
}

const WindowWrapper = React.memo(function WindowWrapper(props: {
  state: PrimitiveAtom<AppWindow>;
}) {
  const state = useAtomValue(props.state);
  useEffect(() => console.log("window create"));

  return React.createElement(state.app, props);
});
