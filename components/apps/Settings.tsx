"use client";

import Image, { StaticImageData } from "next/image";
import { Cog, Dock, ImagePlus, Wallpaper } from "lucide-react";
import AdwaitaDark from "@/public/wallpapers/adwaita-d.webp";
import Adwaita from "@/public/wallpapers/adwaita-l.webp";
import AmberDark from "@/public/wallpapers/amber-d.webp";
import Amber from "@/public/wallpapers/amber-l.webp";
import BlobsDark from "@/public/wallpapers/blobs-d.svg";
import Blobs from "@/public/wallpapers/blobs-l.svg";
import DroolDark from "@/public/wallpapers/drool-d.svg";
import Drool from "@/public/wallpapers/drool-l.svg";
import FoldDark from "@/public/wallpapers/fold-d.webp";
import Fold from "@/public/wallpapers/fold-l.webp";
import GeometricsDark from "@/public/wallpapers/geometrics-d.webp";
import Geometrics from "@/public/wallpapers/geometrics-l.webp";
import GlassChipDark from "@/public/wallpapers/glass-chip-d.webp";
import GlassChip from "@/public/wallpapers/glass-chip-l.webp";
import MorphogenesisDark from "@/public/wallpapers/morphogenesis-d.svg";
import Morphogenesis from "@/public/wallpapers/morphogenesis-l.svg";
import NeogeoDark from "@/public/wallpapers/neogeo-d.webp";
import Neogeo from "@/public/wallpapers/neogeo-l.webp";
import PillsDark from "@/public/wallpapers/pills-d.webp";
import Pills from "@/public/wallpapers/pills-l.webp";
import Pixels from "@/public/wallpapers/pixels-l.jpg";
import RingDark from "@/public/wallpapers/ring-d.webp";
import Ring from "@/public/wallpapers/ring-l.webp";
import SymbolicDark from "@/public/wallpapers/symbolic-d.png";
import Symbolic from "@/public/wallpapers/symbolic-l.png";
import TarkaDark from "@/public/wallpapers/tarka-d.webp";
import Tarka from "@/public/wallpapers/tarka-l.webp";
import VncDark from "@/public/wallpapers/vnc-d.png";
import Vnc from "@/public/wallpapers/vnc-l.png";
import { useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useState } from "react";
import { useTheme } from "next-themes";

export const wallpaperAtom = atomWithStorage<StaticImageData | null>(
  "wallpaper",
  null,
);

export const wallpapers = [
  AdwaitaDark,
  Adwaita,
  AmberDark,
  Amber,
  BlobsDark,
  Blobs,
  DroolDark,
  Drool,
  FoldDark,
  Fold,
  GeometricsDark,
  Geometrics,
  GlassChipDark,
  GlassChip,
  MorphogenesisDark,
  Morphogenesis,
  NeogeoDark,
  Neogeo,
  PillsDark,
  Pills,
  Pixels,
  RingDark,
  Ring,
  SymbolicDark,
  Symbolic,
  TarkaDark,
  Tarka,
  VncDark,
  Vnc,
];

const tabsArray = [
  {
    name: "Wygląd",
    icon: <Wallpaper size={20} className="box-content inline pr-2" />,
    component: AppereanceTab,
  },
  // {
  //   name: "Dock",
  //   icon: <Dock size={20} className="box-content inline pr-2" />
  // }
];

export default function Settings() {
  const [selectedTab, selectTab] = useState(0);

  return (
    <div className="@container flex flex-1 overflow-y-auto">
      <ul className="@sm:block group hidden max-w-56 flex-1 border-r border-zinc-300 bg-neutral-100 p-2 text-sm font-medium dark:border-zinc-600 dark:bg-neutral-800">
        {tabsArray.map((tab, index) => (
          <li
            key={index}
            onClick={() => selectTab(index)}
            data-selected={selectedTab === index}
            className="cursor-pointer text-ellipsis whitespace-nowrap rounded-lg p-2 px-3 transition hover:bg-neutral-200 data-[selected=true]:bg-neutral-200 dark:hover:bg-neutral-700 dark:data-[selected=true]:bg-neutral-700"
          >
            {tab.icon}
            {tab.name}
          </li>
        ))}
      </ul>
      <div className="custom-scrollbar h-full flex-[2] overflow-y-scroll px-8 py-4 dark:bg-neutral-900">
        <div className="mx-auto max-w-xl space-y-4">
          {tabsArray[selectedTab].component()}
        </div>
      </div>
    </div>
  );
}

Settings.appName = "Ustawienia";
Settings.icon = <Cog className="size-4/5" />;

function Theme(props: {
  name: string;
  selected: boolean;
  titleBar: string;
  window: string;
  onClick: () => void;
}) {
  return (
    <div className="max-w-28 flex-1">
      <div
        onClick={props.onClick}
        className={`flex aspect-square max-w-28 flex-1 items-center justify-center rounded-lg border border-neutral-300 bg-slate-500 ring-blue-500 dark:border-neutral-600 ${props.selected ? "ring" : ""}`}
      >
        <div
          className={`size-10/12 overflow-clip rounded-md border ${props.titleBar}`}
        >
          <div className={`flex gap-1 border-b p-1 ${props.window}`}>
            <span className="size-1.5 rounded-full border border-black/[0.06] bg-red-500" />
            <span className="size-1.5 rounded-full border border-black/[0.06] bg-yellow-500" />
            <span className="size-1.5 rounded-full border border-black/[0.06] bg-green-500" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-medium">{props.name}</p>
    </div>
  );
}

function AppereanceTab() {
  const setWallpaper = useSetAtom(wallpaperAtom);
  const { theme, setTheme } = useTheme();

  return (
    <>
      <section>
        <h2 className="mb-2">Motyw</h2>
        <div className="section flex justify-center gap-6">
          <Theme
            name="Jasny"
            selected={theme === "light"}
            titleBar="border-zinc-300 bg-white"
            window="border-zinc-300 bg-neutral-100"
            onClick={() => setTheme("light")}
          />
          <Theme
            name="Ciemny"
            selected={theme === "dark"}
            titleBar="border-zinc-600 bg-neutral-800"
            window="border-zinc-600 bg-neutral-900"
            onClick={() => setTheme("dark")}
          />
        </div>
      </section>
      <section>
        <h2 className="mb-2">Tapeta</h2>
        <div className="section grid grid-cols-[repeat(auto-fill,_128px)] place-content-center gap-4 p-4">
          {wallpapers.map((wallpaper) => (
            <Image
              key={wallpaper.src}
              src={wallpaper}
              height={128}
              width={128}
              alt=""
              className="aspect-square h-32 rounded-lg object-cover"
              onClick={() => setWallpaper(wallpaper)}
            />
          ))}
          <div className="flex size-32 flex-col items-center justify-center rounded-lg bg-neutral-300 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-200">
            <ImagePlus size={36} />
            <span className="text-center text-sm font-medium">
              Wybierz inną tapetę
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
