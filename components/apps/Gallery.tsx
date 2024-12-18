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
import { AnimatePresence, motion } from "motion/react";

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
  const [direction, setDirection] = useState(0);

  function next() {
    setIndex((index) => (index + 1) % images.length);
    setDirection(1);
  }
  function prev() {
    setIndex((index) => (index - 1 + images.length) % images.length);
    setDirection(-1);
  }

  return (
    <div className="relative flex-1">
      <AnimatePresence initial={false} custom={direction}>
        <MotionImage
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              next();
            } else if (swipe > swipeConfidenceThreshold) {
              prev();
            }
          }}
          src={images[index]}
          alt={images[index]}
        />
      </AnimatePresence>
      <button
        className="absolute inset-y-0 left-2 z-10 my-auto size-9 rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-700"
        onClick={prev}
      >
        <ArrowLeft />
      </button>
      <button
        className="absolute inset-y-0 right-2 z-10 my-auto size-9 rounded-full bg-neutral-200 p-1.5 dark:bg-neutral-700"
        onClick={next}
      >
        <ArrowRight />
      </button>
    </div>
  );
}

Gallery.appName = "Gallery";
Gallery.icon = <ImageIcon className="size-3/5" />;

function LoadingImage(props: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Image
        {...props}
        onLoad={() => setLoaded(true)}
        fill
        className="object-contain"
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoaderCircle className="size-8 animate-spin" strokeWidth={3} />
        </div>
      )}
    </>
  );
}

const MotionImage = motion.create(LoadingImage);

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity;
}
