/* eslint-disable react-hooks/exhaustive-deps */
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
import { atomFamily, atomWithStorage } from "jotai/utils";
import React, { useCallback, useMemo } from "react";
import { create } from "zustand";

type WindowStore = {
  windows: Window[];
  pinnedApps: React.FC[];
};

// const useWindowStore = create<WindowStore>((set) => ({
//   windows: [],
//   pinnedApps: [],
//   openApp: (app: React.FC) =>
//     set((state) => ({
//       windows: [...state.windows, { app, visibility: "floating" }],
//     })),
//   closeAppWindows: (name: string) =>
//     set((state) => ({
//       windows: state.windows.filter((w) => w.app.name !== name),
//     })),
    
//   pinApp: (app: React.FC) => {
//     set((state) => {
//       if (state.pinnedApps.includes(app)) {
//         return state;
//       }
//       return { pinnedApps: [...state.pinnedApps, app] };
//     });
//   },
// }));

type Window = {
  visibility: "floating" | "minimized" | "maximized";
  app: React.FC;
};

export type AppState = {
  name: string;
  pinned: boolean;
  visibility: "closed" | "floating" | "minimized" | "maximized";
  lastPosition: { x: number; y: number };
  lastSize: { width: number; height: number };
};

const appAtomFamily = atomFamily(
  (state: AppState) => atom(state),
  (a, b) => a.name === b.name,
);

export const opendedAppsAtom = atom<string[]>([]);

const variants = {
  floating: (point: { x: number; y: number }) => ({
    ...point,
    top: 0,
    left: 0,
    transition: { type: "tween" },
  }),
  exit: {
    scale: 0.7,
    opacity: 0,
    transition: { duration: 0.2 },
    transitionEnd: { display: "none" },
  },
  maximized: (props: {}) => ({
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    transition: { type: "tween" },
  }),
};

const minHeight = 128;
const minWidth = 196;

export default function App({
  name,
  children,
  headerLeft,
  onExit,
}: {
  name: string;
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  onExit?: () => void;
}) {
  const [appState, setAppState] = useAtom(
    appAtomFamily({
      name,
      pinned: false,
      visibility: "floating",
      lastPosition: {
        x: (window.innerWidth - 512) / 2,
        y: (window.innerHeight - 512) / 2,
      },
      lastSize: { width: 512, height: 512 },
    }),
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const appStateMemo = useMemo(() => appState, []);
  const [stack, setStack] = useAtom(opendedAppsAtom);
  const order = stack.indexOf(name);

  const width = useMotionValue(appState.lastSize.width);
  const height = useMotionValue(appState.lastSize.height);
  const x = useMotionValue(appState.lastPosition.x);
  const y = useMotionValue(appState.lastPosition.y);

  const controls = useDragControls();

  function setOnTop() {
    setStack((prev) => {
      return [...prev.slice(0, order), ...prev.slice(order + 1), name];
    });
  }

  const close = useCallback(() => {
    setAppState((prev) => ({ ...prev, visibility: "closed" }));
    setStack((prev) => prev.filter((n) => n !== name));
    onExit?.();
  }, [onExit, name]);

  const minimize = useCallback(
    () => setAppState((prev) => ({ ...prev, visibility: "minimized" })),
    [],
  );

  const maximize = useCallback(() => {
    setAppState((prev) => {
      if (prev.visibility === "maximized") {
        return {
          ...prev,
          visibility: "floating",
        };
      } else {
        return {
          ...prev,
          lastPosition: {
            x: x.get(),
            y: y.get(),
          },
          visibility: "maximized",
        };
      }
    });
  }, []);

  const saveSize = useCallback(() => {
    setAppState((prev) => ({
      ...prev,
      lastSize: { width: width.get(), height: height.get() },
      lastPosition: { x: x.get(), y: y.get() },
    }));
  }, []);

  const resizeLeft = useCallback(
    (info: PanInfo) =>
      resizeSizePosition(width, minWidth, info.delta.x, x, info.point.x),
    [width],
  );

  const resizeRight = useCallback(
    (info: PanInfo) =>
      resizeSize(width, minWidth, info.delta.x, x.get(), info.point.x),
    [width, x],
  );

  const resizeTop = useCallback(
    (info: PanInfo) =>
      resizeSizePosition(height, minHeight, info.delta.y, y, info.point.y),
    [height, y],
  );

  const resizeBottom = useCallback(
    (info: PanInfo) =>
      resizeSize(height, minHeight, info.delta.y, y.get(), info.point.y),
    [height, y],
  );

  return (
    <AnimatePresence>
      {appState.visibility !== "closed" && (
        <motion.div
          custom={appStateMemo.lastPosition}
          style={{ zIndex: 10 + order, width, height, x, y }}
          variants={variants}
          animate={
            appState.visibility === "maximized"
              ? "maximized"
              : appState.visibility === "minimized"
                ? "exit"
                : "floating"
          }
          exit="exit"
          onDragEnd={() => {
            setAppState((prev) => ({
              ...prev,
              lastPosition: { x: x.get(), y: y.get() },
            }));
          }}
          drag={appState.visibility === "floating"}
          dragControls={controls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0}
          className="absolute flex select-none flex-col overflow-clip rounded-xl border border-zinc-600 bg-neutral-800 shadow-2xl"
          onTapStart={setOnTop}
          _dragX={x}
          _dragY={y}
        >
          <div
            onPointerDown={(event) => controls.start(event)}
            onDoubleClick={maximize}
            className="flex select-none items-center border-b border-zinc-600 bg-neutral-900"
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
          {children}
          <motion.div
            onPan={(event, info) => resizeLeft(info)}
            onPanEnd={saveSize}
            className="absolute -left-1 top-0 h-full w-1 cursor-w-resize"
          />
          <motion.div
            onPan={(event, info) => resizeRight(info)}
            onPanEnd={saveSize}
            className="absolute right-0 top-0 h-full w-[1px] cursor-e-resize"
          />
          <motion.div
            onPan={(event, info) => resizeTop(info)}
            onPanEnd={saveSize}
            className="absolute top-0 h-[1px] w-full cursor-n-resize"
          />
          <motion.div
            onPan={(event, info) => resizeBottom(info)}
            onPanEnd={saveSize}
            className="absolute bottom-0 h-[1px] w-full cursor-s-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeTop(info);
              resizeLeft(info);
            }}
            onPanEnd={saveSize}
            className="absolute left-0 top-0 size-2 cursor-nw-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeTop(info);
              resizeRight(info);
            }}
            onPanEnd={saveSize}
            className="absolute right-0 top-0 size-2 cursor-ne-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeBottom(info);
              resizeRight(info);
            }}
            onPanEnd={saveSize}
            className="absolute bottom-0 right-0 size-2 cursor-se-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeBottom(info);
              resizeLeft(info);
            }}
            onPanEnd={saveSize}
            className="absolute bottom-0 left-0 size-2 cursor-sw-resize"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function resizeSize(
  size: MotionValue<number>,
  minSize: number,
  delta: number,
  coordinate: number,
  newCoordinate: number,
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

function resizeSizePosition(
  size: MotionValue<number>,
  minSize: number,
  delta: number,
  coordinate: MotionValue<number>,
  newCoordinate: number,
) {
  const sizeValue = size.get();
  const coordinateValue = coordinate.get();
  if (
    sizeValue - delta > minSize &&
    ((delta < 0 && newCoordinate <= coordinateValue) ||
      (delta > 0 && newCoordinate >= coordinateValue))
  ) {
    size.set(sizeValue - delta);
    coordinate.set(coordinateValue + delta);
  }
}
