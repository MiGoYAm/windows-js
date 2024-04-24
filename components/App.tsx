"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import {
  MotionValue,
  PanInfo,
  motion,
  useDragControls,
  useMotionValue,
} from "framer-motion";
import { PrimitiveAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily, splitAtom } from "jotai/utils";
import React, { useCallback, useEffect } from "react";
import Notepad from "./apps/Notepad";
import { browserWindowAtom, useNotReactiveAtom } from "./hooks";

export type AppProps = { state: PrimitiveAtom<AppWindow> };
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
    display: "flex",
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
}: {
  name: string;
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
} & AppProps) {
  const [window, setWindow] = useAtom(state);
  const setAppState = useSetAtom(appAtomFamily(name));
  const closeWindow = useSetAtom(closeWindowAtom);

  const appState = useNotReactiveAtom((get) => {
    const offset =
      (get(windowsAtom).filter((w) => w.app === window.app).length - 1) * 20;
    const app = get(appAtomFamily(name));

    return {
      ...app,
      lastPosition: {
        x: (app.lastPosition?.x ?? 0) + offset,
        y: (app.lastPosition?.y ?? 0) + offset,
      },
    };
  });

  //const [order, setOrder] = useState(maxOrder);

  const width = useMotionValue(appState.lastSize.width);
  const height = useMotionValue(appState.lastSize.height);
  const x = useMotionValue(appState.lastPosition.x);
  const y = useMotionValue(appState.lastPosition.y);

  const browserWindow = useAtomValue(browserWindowAtom);

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

  const setOnTop = useCallback(() => {
    // setOrder((prev) => {
    //   if (prev === maxOrder) {
    //     return prev;
    //   }
    //   maxOrder += 1;
    //   return maxOrder;
    // });
  }, []);

  useEffect(() => {
    console.log("app rerender", state.toString());
  });
  useEffect(() => {
    console.log("app rerender window", window);
  }, [window]);
  useEffect(() => {
    console.log("app rerender browser window", browserWindow);
  }, [browserWindow]);

  const close = () => closeWindow(state);

  const minimize = () =>
    setWindow((prev) => ({ ...prev, visibility: "minimized" }));

  const maximize = () =>
    setWindow((prev) => ({
      ...prev,
      visibility: prev.visibility === "maximized" ? "floating" : "maximized",
    }));

  const save = useCallback(() => {
    setAppState((prev) => ({
      ...prev,
      lastSize: { width: width.get(), height: height.get() },
      lastPosition: { x: x.get(), y: y.get() },
    }));
  }, []);

  const resizeLeft = (info: PanInfo) =>
    resizeSizePosition(width, minWidth, info.delta.x, x, info.point.x);

  const resizeRight = (info: PanInfo) =>
    resizeSize(width, minWidth, info.delta.x, x.get(), info.point.x);

  const resizeTop = (info: PanInfo) =>
    resizeSizePosition(height, minHeight, info.delta.y, y, info.point.y);

  const resizeBottom = (info: PanInfo) =>
    resizeSize(height, minHeight, info.delta.y, y.get(), info.point.y);

  return (
    <motion.div
      layout
      custom={browserWindow}
      style={{ zIndex: 10, width, height, x, y }}
      variants={variants}
      animate={
        window.visibility === "maximized"
          ? "maximized"
          : window.visibility === "minimized"
            ? "exit"
            : "floating"
      }
      exit="exit"
      drag={window.visibility === "floating"}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={save}
      onTapStart={setOnTop}
      _dragX={x}
      _dragY={y}
      className="absolute flex select-none flex-col overflow-clip rounded-xl border border-zinc-600 bg-neutral-800 shadow-2xl"
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
      {window.visibility === "floating" && (
        <>
          <motion.div
            onPan={(event, info) => resizeLeft(info)}
            onPanEnd={save}
            className="absolute left-0 top-0 h-full w-px cursor-w-resize"
          />
          <motion.div
            onPan={(event, info) => resizeRight(info)}
            onPanEnd={save}
            className="absolute right-0 top-0 h-full w-px cursor-e-resize"
          />
          <motion.div
            onPan={(event, info) => resizeTop(info)}
            onPanEnd={save}
            className="absolute top-0 h-px w-full cursor-n-resize"
          />
          <motion.div
            onPan={(event, info) => resizeBottom(info)}
            onPanEnd={save}
            className="absolute bottom-0 h-px w-full cursor-s-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeTop(info);
              resizeLeft(info);
            }}
            onPanEnd={save}
            className="absolute left-0 top-0 size-2 cursor-nw-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeTop(info);
              resizeRight(info);
            }}
            onPanEnd={save}
            className="absolute right-0 top-0 size-2 cursor-ne-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeBottom(info);
              resizeRight(info);
            }}
            onPanEnd={save}
            className="absolute bottom-0 right-0 size-2 cursor-se-resize"
          />
          <motion.div
            onPan={(event, info) => {
              resizeBottom(info);
              resizeLeft(info);
            }}
            onPanEnd={save}
            className="absolute bottom-0 left-0 size-2 cursor-sw-resize"
          />
        </>
      )}
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
