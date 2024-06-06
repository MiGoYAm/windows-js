"use client";

import Dock from "@/components/Dock";
import { useWindowSize } from "@/lib/hooks";
import { AnimatePresence } from "framer-motion";
import { useAtomValue } from "jotai";
import React from "react";
import Window from "@/components/App";
import { windowAtomsAtom } from "@/lib/atoms";
import { wallpaperAtom } from "@/components/apps/Settings";

export default function Home() {
  useWindowSize();

  return (
    <main className="relative h-screen w-screen overflow-clip dark:bg-black">
      <Wallpaper />
      <Desktop />
      <Dock />
    </main>
  );
}

function Wallpaper() {
  const wallpaper = useAtomValue(wallpaperAtom);

  return (
    wallpaper && (
      <div
        className="absolute h-screen w-screen bg-cover bg-center"
        style={{
          backgroundImage: `url(${wallpaper.src})`,
        }}
      />
    )
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
