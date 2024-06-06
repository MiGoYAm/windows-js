/* eslint-disable jsx-a11y/alt-text */
import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  LoaderCircle,
} from "lucide-react";
import { wallpapers } from "./Settings";
import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { AppProps } from "@/lib/types";
import React from "react";

export const images: string[] = [
  ...wallpapers.map((wallpaper) => wallpaper.src),
];

export type GalleryProps = AppProps & { initialImage?: string };

export default function Gallery(props: GalleryProps) {
  const [index, setIndex] = useState(() => {
    if (!props.initialImage) return 0;

    const i = images.indexOf(props.initialImage);
    if (i !== -1) {
      return i;
    }
    return 0;
  });

  function next() {
    setIndex((index) => (index + 1) % images.length);
  }
  function prev() {
    setIndex((index) => (index - 1 + images.length) % images.length);
  }

  return (
    <div className="relative flex-1">
      <LoadingImage
        key={index}
        src={images[index]}
        alt=""
      />
      <button
        className="absolute inset-y-0 left-2 my-auto size-9 rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-700"
        onClick={prev}
      >
        <ArrowLeft />
      </button>
      <button
        className="absolute inset-y-0 right-2 my-auto size-9 rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-700"
        onClick={next}
      >
        <ArrowRight />
      </button>
    </div>
  );
}

Gallery.appName = "Gallery";
Gallery.icon = <ImageIcon className="size-3/5" />;

const LoadingImage = React.forwardRef<HTMLImageElement, ImageProps>(
  (props, ref) => {
    const [loaded, setLoaded] = useState(false);

    return (
      <>
        <Image
          {...props}
          onLoad={() => setLoaded(true)}
          fill
          className="object-contain"
          ref={ref}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoaderCircle className="size-8 animate-spin" strokeWidth={3} />
          </div>
        )}
      </>
    );
  },
);

LoadingImage.displayName = "LoadingImage";
