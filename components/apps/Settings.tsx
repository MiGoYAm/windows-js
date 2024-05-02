import Image, { StaticImageData } from "next/image";
import { Cog, ImagePlus } from "lucide-react";
import BlobsDark from "@/public/wallpapers/blobs-d.svg";
import Blobs from "@/public/wallpapers/blobs-l.svg";
import DroolDark from "@/public/wallpapers/drool-d.svg";
import Drool from "@/public/wallpapers/drool-l.svg";
import MorphogenesisDark from "@/public/wallpapers/morphogenesis-d.svg";
import Morphogenesis from "@/public/wallpapers/morphogenesis-l.svg";
import Pixels from "@/public/wallpapers/pixels-l.jpg";
import Symbolic from "@/public/wallpapers/symbolic-l.png";
import Vnc from "@/public/wallpapers/vnc-d.png";
import { atom, useSetAtom } from "jotai";

export const wallpaperAtom = atom<StaticImageData | null>(null);

const wallpapers = [
  BlobsDark,
  Blobs,
  DroolDark,
  Drool,
  MorphogenesisDark,
  Morphogenesis,
  Pixels,
  Symbolic,
  Vnc,
];

export default function Settings() {
  const setWallpaper = useSetAtom(wallpaperAtom);

  return (
    <div className="flex flex-1 overflow-y-auto text-white">
      <ul className="w-48 flex-none bg-neutral-900 p-2">
        <li className="rounded-lg p-2 hover:bg-neutral-800">Wygląd</li>
      </ul>
      <div className="custom-scrollbar h-full flex-1 space-y-8 overflow-y-scroll p-4">
        <div>
          <h2>Motyw</h2>
        </div>
        <div>
          <h2 className="mb-4">Tapeta</h2>
          <div className="grid grid-cols-[repeat(auto-fill,_128px)] place-content-center gap-4 rounded-xl bg-neutral-900 p-4">
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
            <div className="flex size-32 flex-col items-center justify-center rounded-lg bg-neutral-600 text-neutral-200">
              <ImagePlus className="size-12" />
              <span className="text-center text-sm font-medium">
                Wybierz inną tapetę
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Settings.appName = "Settings";
Settings.icon = <Cog className="size-4/5" />;
