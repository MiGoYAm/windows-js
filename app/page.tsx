"use client";

import Dock from "@/components/Dock";
import { useWindowSize } from "@/lib/hooks";
import { AnimatePresence } from "framer-motion";
import { useAtomValue } from "jotai";
import { memo } from "react";
import Window from "@/components/App";
import { windowAtomsAtom } from "@/lib/atoms";
import { wallpaperAtom } from "@/components/apps/Settings";
import Image from "next/image";

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
    <Image
      src={wallpaper}
      alt="Wallpaper"
      fill
      sizes="100vw"
      priority
      quality={85}
      className="z-0 object-cover"
    />
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

const WindowMemo = memo(Window);
