"use client";

import { AppWindow, windowAtomsAtom } from "@/components/App";
import Dock from "@/components/Dock";
import { AnimatePresence } from "framer-motion";
import { PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import React from "react";

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-clip dark:bg-black">
      <Desktop />
      <Dock />
    </main>
  );
}

function Desktop() {
  const [windows, dispatch] = useAtom(windowAtomsAtom);

  return (
    <AnimatePresence>
      {windows.map((windowAtom) => (
        <WindowWrapper
          stateAtom={windowAtom}
          close={() => dispatch({ type: "remove", atom: windowAtom })}
          key={`${windowAtom}`}
        />
      ))}
    </AnimatePresence>
  );
}

function WindowWrapper({
  stateAtom,
  close,
}: {
  stateAtom: PrimitiveAtom<AppWindow>;
  close: () => void;
}) {
  const state = useAtomValue(stateAtom);

  return React.createElement(state.app, {
    state: stateAtom,
    close: close,
  });
}
