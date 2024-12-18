"use client";

import Dock from "@/components/Dock";
import { useWindowSize } from "@/lib/hooks";
import { AnimatePresence } from "motion/react";
import { useAtomValue } from "jotai";
import React from "react";
import Window from "@/components/App";
import { windowAtomsAtom } from "@/lib/atoms";
import { wallpaperAtom } from "@/components/apps/Settings";
import { getImageProps } from "next/image";

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

function getImageSet(srcSet = "") {
  const imageSet = srcSet
    .split(", ")
    .map((str) => {
      const [url, dpi] = str.split(" ");
      return `url("${url}") ${dpi}`;
    })
    .join(", ");
  return `image-set(${imageSet})`;
}

function getBackgroundImage(image: string) {
  const { props } = getImageProps({
    alt: "",
    width: 4096,
    height: 4096,
    src: image,
  });
  return getImageSet(props.srcSet);
}

function Wallpaper() {
  const wallpaper = useAtomValue(wallpaperAtom);

  return (
    wallpaper && (
      <div
        className="absolute h-screen w-screen bg-cover bg-center"
        style={{ backgroundImage: getBackgroundImage(wallpaper.src) }}
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
