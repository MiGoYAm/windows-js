"use client";

import {
  AnimatePresence,
  MotionValue,
  PanInfo,
  motion,
  useDragControls,
  useMotionValue,
} from "framer-motion";
import { atom, useAtom } from "jotai";
import React, { useCallback, useRef, useState } from "react";

const stackAtom = atom<string[]>([]);

const variants = {
  floating: (point: { x: number; y: number }) => ({
    ...point,
    transition: { type: "tween" },
  }),
  exit: {
    scale: 0.7,
    opacity: 0,
    transition: { duration: 0.2 },
    transitionEnd: { display: "none" },
  },
  maximized: {
    x: 0,
    y: 0,
    width: "",
    height: "",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: { type: "tween" },
  },
};

type WindowState = "closed" | "floating" | "minimized" | "maximized";

const minHeight = 64;
const minWidth = 196;

function resizeSize(
  size: MotionValue<number>,
  minSize: number,
  delta: number,
  coordinate: number,
  newCoordinate: number
) {
  const sizeValue = size.get();
  if (
    sizeValue + delta > minSize &&
    ((delta < 0 && newCoordinate <= coordinate + sizeValue) ||
      (delta > 0 && newCoordinate >= coordinate + sizeValue))
  ) {
    size.set(sizeValue + delta);
  }
}

function resizeSizePosition() {}

export default function App({
  name,
  children,
  className = "",
  headerLeft,
  onExit,
}: {
  name: string;
  children: React.ReactNode;
  className?: string;
  headerLeft?: React.ReactNode;
  onExit?: () => void;
}) {
  const [visibility, setVisibility] = useState<WindowState>("floating");
  const [stack, setStack] = useAtom(stackAtom);
  const order = stack.indexOf(name);

  const x = useMotionValue(window.innerWidth / 2 - 128);
  const y = useMotionValue(window.innerHeight / 2 - 128);

  const width = useMotionValue(256);
  const height = useMotionValue(256);

  const prevPosition = useRef({ x: x.get(), y: y.get() });
  const controls = useDragControls();

  function setOnTop() {
    setStack((prev) => {
      return [...prev.slice(0, order), ...prev.slice(order + 1), name];
    });
  }

  const close = useCallback(() => {
    setVisibility("closed");
    onExit?.();
  }, [onExit]);
  const minimize = useCallback(() => setVisibility("minimized"), []);

  function maximize() {
    setVisibility((prev) => {
      if (prev === "maximized") {
        return "floating";
      } else {
        prevPosition.current = { x: x.get(), y: y.get() };
        return "maximized";
      }
    });
  }

  function resizeLeft(info: PanInfo) {
    if (
      width.get() - info.delta.x > minWidth &&
      ((info.delta.x < 0 && info.point.x <= x.get()) ||
        (info.delta.x > 0 && info.point.x >= x.get()))
    ) {
      width.set(width.get() - info.delta.x);
      x.set(x.get() + info.delta.x);
    }
  }

  function resizeRight(info: PanInfo) {
    // if (
    //   width.get() + info.delta.x > minWidth &&
    //   ((info.delta.x < 0 && info.point.x <= x.get() + width.get()) ||
    //     (info.delta.x > 0 && info.point.x >= x.get() + width.get()))
    // ) {
    //   width.set(width.get() + info.delta.x);
    // }
    resizeSize(width, minWidth, info.delta.x, x.get(), info.point.x);
  }

  function resizeTop(info: PanInfo) {
    if (
      height.get() - info.delta.y > minHeight &&
      ((info.delta.y < 0 && info.point.y <= y.get()) ||
        (info.delta.y > 0 && info.point.y >= y.get()))
    ) {
      height.set(height.get() - info.delta.y);
      y.set(y.get() + info.delta.y);
    }
  }

  function resizeBottom(info: PanInfo) {
    // if (
    //   height.get() + info.delta.y > minHeight &&
    //   ((info.delta.y < 0 && info.point.y <= y.get() + height.get()) ||
    //     (info.delta.y > 0 && info.point.y >= y.get() + height.get()))
    // ) {
    //   height.set(height.get() + info.delta.y);
    // }
    resizeSize(height, minHeight, info.delta.y, y.get(), info.point.y);
  }

  return (
    <AnimatePresence>
      {visibility !== "closed" && (
        <motion.div
          custom={prevPosition.current}
          style={{ zIndex: 10 + order, width, height, x, y }}
          variants={variants}
          animate={[
            visibility === "maximized"
              ? "maximized"
              : visibility === "minimized"
              ? "exit"
              : "floating",
          ]}
          exit="exit"
          drag={visibility === "floating"}
          dragControls={controls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0}
          className={`overflow-clip rounded-xl border border-zinc-600 bg-neutral-800 shadow-2xl absolute select-none ${className}`}
          onTapStart={setOnTop}
          _dragX={x}
          _dragY={y}
        >
          <div
            onPointerDown={(event) => controls.start(event)}
            onDoubleClick={maximize}
            className="flex items-center border-b border-zinc-600 bg-neutral-900 select-none"
          >
            <div className="flex-1">
              <div className="flex gap-2 p-4">
                <span
                  onClick={close}
                  className="size-3 rounded-full border border-black/[0.06] bg-red-500 transition duration-100 active:bg-red-700"
                />
                <span
                  onClick={minimize}
                  className="size-3 rounded-full border border-black/[0.06] bg-yellow-500 transition duration-100 active:bg-yellow-700"
                />
                <span
                  onClick={maximize}
                  className="size-3 rounded-full border border-black/[0.06] bg-green-500 transition duration-100 active:bg-green-700"
                />
              </div>
            </div>
            <h3 className="text-lg text-white">{name}</h3>
            <div className="flex-1">
              <div className="m-1 flex items-center justify-end">
                {headerLeft}
              </div>
            </div>
          </div>
          <motion.div
            onPan={(event, info) => resizeLeft(info)}
            className="absolute left-0 top-0 h-full w-[1px] cursor-w-resize"
          />
          <motion.div
            onPan={(event, info) => resizeRight(info)}
            className="absolute right-0 top-0 h-full w-[1px] cursor-e-resize"
          />
          <motion.div
            onPan={(event, info) => resizeTop(info)}
            className="absolute top-0 w-full h-[1px] cursor-n-resize"
          />
          <motion.div
            onPan={(event, info) => resizeBottom(info)}
            className="absolute bottom-0 w-full h-[1px] cursor-s-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeTop(info);
              resizeLeft(info);
            }}
            className="absolute top-0 left-0 size-2 cursor-nw-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeTop(info);
              resizeRight(info);
            }}
            className="absolute top-0 right-0 size-2 cursor-ne-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeBottom(info);
              resizeRight(info);
            }}
            className="absolute bottom-0 right-0 size-2 cursor-se-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeBottom(info);
              resizeLeft(info);
            }}
            className="absolute bottom-0 left-0 size-2 cursor-sw-resize"
          />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
