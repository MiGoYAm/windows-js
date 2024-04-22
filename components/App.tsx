"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import {
  MotionValue,
  PanInfo,
  motion,
  useDragControls,
  useMotionValue,
} from "framer-motion";
import { PrimitiveAtom, atom, useAtom, useSetAtom } from "jotai";
import { atomFamily, splitAtom } from "jotai/utils";
import React, { useCallback, useEffect, useState } from "react";
import Notepad from "./Notepad";
import { useNotReactiveAtom, useWindowSize } from "./hooks";

export type AppProps = { state: PrimitiveAtom<AppWindow>; close: () => void };
export type Visibility = "floating" | "minimized" | "maximized";

export type AppWindow = {
  visibility: Visibility;
  app: React.FC<AppProps> & { appName: string };
};

type App = {
  lastPosition: { x: number; y: number } | null;
  lastSize: { width: number; height: number };
};

const appAtomFamily = atomFamily((name: string) =>
  atom<App>({
    lastPosition: null,
    lastSize: { width: 512, height: 512 },
  }),
);

export const windowsAtom = atom<AppWindow[]>([
  {
    app: Notepad,
    visibility: "floating",
  },
  // {
  //   app: Camera,
  //   visibility: "floating"
  // }
]);

export const windowAtomsAtom = splitAtom(windowsAtom);

export const openAppAtom = atom(null, (get, set, app: AppWindow["app"]) => {
  set(windowsAtom, [...get(windowsAtom), { app, visibility: "floating" }]);
});

export const closeWindowAtom = atom(
  null,
  (get, set, app: PrimitiveAtom<AppWindow>) => {
    set(windowAtomsAtom, { type: "remove", atom: app });
  },
);

const variants = {
  floating: {
    // top: 0,
    // left: 0,
    display: "block",
    transition: { type: "tween" },
  },
  exit: {
    scale: 0.7,
    opacity: 0,
    transition: { duration: 0.2 },
    transitionEnd: { display: "none" },
  },
  maximized: (props: { width: number | null; height: number | null }) => ({
    x: 0,
    y: 0,
    width: props.width ?? 0,
    height: props.height ?? 0,
    transition: { type: "tween" },
  }),
};

const minHeight = 128;
const minWidth = 196;

let maxOrder = 10;

export default function App({
  name,
  children,
  headerLeft,
  state,
  close: closeApp,
  onExit,
}: {
  name: string;
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  onExit?: () => void;
} & AppProps) {
  const [window, setWindow] = useAtom(state);
  const setAppState = useSetAtom(appAtomFamily(name));

  const browserWindow = useWindowSize();

  const appState = useNotReactiveAtom((get) => {
    const offset =
      get(windowsAtom).filter((w) => w.app === window.app).length * 20;
    const app = get(appAtomFamily(name));

    const x = app.lastPosition?.x ?? 0 + offset;
    const y = app.lastPosition?.y ?? 0 + offset;

    return {
      ...app,
      lastPosition: {
        x,
        y,
      },
    };
  });

  useEffect(() => {
    console.log("app rerender");
  });

  const [order, setOrder] = useState(maxOrder);

  const width = useMotionValue(appState.lastSize.width);
  const height = useMotionValue(appState.lastSize.height);
  const x = useMotionValue(appState.lastPosition.x);
  const y = useMotionValue(appState.lastPosition.y);

  useNotReactiveAtom(
    (get, set) => {
      const app = get(appAtomFamily(name));

      if (app.lastPosition === null && browserWindow !== null) {
        const lastPosition = {
          x: (browserWindow.width - app.lastSize.width) / 2,
          y: (browserWindow.height - app.lastSize.height) / 2,
        };
        x.set(lastPosition.x);
        y.set(lastPosition.y);
        set(appAtomFamily(name), { ...app, lastPosition });
      }
    },
    [browserWindow],
  );

  const controls = useDragControls();

  useEffect(() => {
    console.log("app rerender");
  }, []);

  const setOnTop = useCallback(() => {
    setOrder((prev) => {
      if (prev === maxOrder) {
        return prev;
      }
      maxOrder += 1;
      return maxOrder;
    });
  }, []);

  const close = useCallback(() => {
    closeApp();
    onExit?.();
  }, [onExit]);

  const minimize = useCallback(
    () => setWindow((prev) => ({ ...prev, visibility: "minimized" })),
    [],
  );

  const maximize = useCallback(
    () =>
      setWindow((prev) => ({
        ...prev,
        visibility: prev.visibility === "maximized" ? "floating" : "maximized",
      })),
    [],
  );

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
    [],
  );

  const resizeRight = useCallback(
    (info: PanInfo) =>
      resizeSize(width, minWidth, info.delta.x, x.get(), info.point.x),
    [],
  );

  const resizeTop = useCallback(
    (info: PanInfo) =>
      resizeSizePosition(height, minHeight, info.delta.y, y, info.point.y),
    [],
  );

  const resizeBottom = useCallback(
    (info: PanInfo) =>
      resizeSize(height, minHeight, info.delta.y, y.get(), info.point.y),
    [],
  );

  return (
    <motion.div
      custom={browserWindow}
      style={{ zIndex: order, width, height, x, y }}
      variants={variants}
      animate={
        window.visibility === "maximized"
          ? "maximized"
          : window.visibility === "minimized"
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
      drag={window.visibility === "floating"}
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
          <div className="m-1 flex items-center justify-end">{headerLeft}</div>
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
