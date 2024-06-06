"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import {
  DragControls,
  MotionValue,
  PanInfo,
  motion,
  useAnimationControls,
  useDragControls,
  useMotionValue,
} from "framer-motion";
import { PrimitiveAtom, atom, useAtomValue, useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {
  browserWindowAtom,
  useNotReactiveAtom,
  useWindowListener,
} from "../lib/hooks";
import { AppComponent, AppProps, AppWindow, WindowProps } from "@/lib/types";
import {
  appAtomFamily,
  closeWindowAtom,
  maximizeWindowAtom,
  selectWindowAtom,
  windowAtomsAtom,
  zIndexAtom,
} from "@/lib/atoms";
import { once } from "@/lib/once";

type VariantProps = {
  width: number;
  height: number;
  x: number;
  y: number;
  browser: { width: number; height: number } | null;
};

const variants = {
  close: {
    scale: 0.8,
    opacity: 0,
    originY: 0.5,
  },
  minimized: {
    scale: 0.7,
    opacity: 0,
    originY: 1,
    transitionEnd: {
      display: "none",
    },
  },
  notMinimized: {
    scale: 1,
    opacity: 1,
    originY: 1,
    display: "",
  },
  floating: (props: VariantProps) => ({
    width: [props.browser?.width ?? props.width, props.width],
    height: [props.browser?.height ?? props.height, props.height],
    x: props.x,
    y: props.y,
  }),
  maximized: (props: VariantProps) => ({
    x: 0,
    y: 0,
    ...props.browser,
    transitionEnd: {
      width: "100%",
      height: "100%",
    },
  }),
};

const minHeight = 256;
const minWidth = 256;

export default function Window({ state }: WindowProps) {
  const window = useAtomValue(state);
  const appAtom = useMemo(() => appAtomFamily(window.app.appName), []);
  const setAppState = useSetAtom(appAtom);
  const windowOnTop = useSetAtom(selectWindowAtom);

  const appState = useNotReactiveAtom((get) => {
    const offset =
      (get(windowAtomsAtom).filter((a) => get(a).app === window.app).length -
        1) *
      20;
    const app = get(appAtom);

    return {
      ...app,
      lastPosition: {
        x: (app.lastPosition?.x ?? 0) + offset,
        y: (app.lastPosition?.y ?? 0) + offset,
      },
    };
  });

  const width = useMotionValue(appState.lastSize.width);
  const height = useMotionValue(appState.lastSize.height);
  const x = useMotionValue(appState.lastPosition.x);
  const y = useMotionValue(appState.lastPosition.y);

  useWindowListener(
    useCallback(
      (get, _, browserWindow) => {
        if (get(state).maximized || !browserWindow) return;

        if (x.get() > browserWindow.width - width.get()) {
          x.set(browserWindow.width - width.get());
        }
        if (y.get() > browserWindow.height - 45) {
          y.set(browserWindow.height - 45);
        }
      },
      [state],
    ),
  );

  const readBrowserWindow = useAtomCallback(
    useCallback((get) => get(browserWindowAtom), []),
  );

  const prevState = useRef({
    width: width.get(),
    height: height.get(),
    x: x.get(),
    y: y.get(),
  });

  useEffect(() => {
    console.log("app rerender", state.toString());
  });

  const animationControls = useAnimationControls();
  const dragControls = useDragControls();
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (window.maximized) {
      animationControls.start("maximized");
    } else if (!isFirstRender.current) {
      animationControls.start("floating");
    }

    return () => animationControls.stop();
  }, [window.maximized]);

  useLayoutEffect(() => {
    animationControls.start(window.minimized ? "minimized" : "notMinimized");

    return () => animationControls.stop();
  }, [window.minimized]);

  useEffect(() => {
    isFirstRender.current = false;
    return () => {
      isFirstRender.current = true;
    };
  }, []);

  const setOnTop = () => windowOnTop(state);

  const save = useCallback(() => {
    prevState.current = {
      width: width.get(),
      height: height.get(),
      x: x.get(),
      y: y.get(),
    };

    setAppState((prev) => ({
      ...prev,
      lastSize: {
        width: prevState.current.width,
        height: prevState.current.height,
      },
      lastPosition: { x: prevState.current.x, y: prevState.current.y },
    }));
  }, []);

  return (
    <motion.div
      layout="size"
      variants={variants}
      custom={{
        ...prevState.current,
        browser: readBrowserWindow(),
      }}
      transition={{ type: "tween", duration: 0.2 }}
      initial="close"
      style={{ zIndex: window.zIndex, x, y, width, height }}
      animate={animationControls}
      exit="close"
      drag={!window.maximized}
      dragConstraints={{ top: 0 }}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={save}
      onTapStart={setOnTop}
      _dragX={x}
      _dragY={y}
      className="absolute flex select-none flex-col overflow-clip rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white shadow-2xl dark:bg-neutral-800"
    >
      {!window.app.customTitleBar && (
        <TitleBar
          title={window.app.appName}
          dragControls={dragControls}
          state={state}
        />
      )}
      <WindowBody body={window.app} state={state} dragControls={dragControls} />
      {!window.maximized && (
        <ResizeBorder width={width} height={height} x={x} y={y} save={save} />
      )}
    </motion.div>
  );
}

const WindowBody = once(function WindowBody(
  props: AppProps & { body: AppComponent },
) {
  const { body, state, dragControls } = props;
  return React.createElement(body, { state, dragControls });
});

export const TitleBar = once(function TitleBar(props: {
  title: string;
  dragControls: DragControls;
  children?: React.ReactNode;
  state: PrimitiveAtom<AppWindow>;
}) {
  const setWindow = useSetAtom(props.state);
  const closeWindow = useSetAtom(closeWindowAtom);
  const maximizeWindow = useSetAtom(maximizeWindowAtom);

  const isSelected = useAtomValue(
    useMemo(() => {
      return atom((get) => get(props.state).zIndex === get(zIndexAtom));
    }, []),
  );

  const close = () => closeWindow(props.state);
  const minimize = () => setWindow((prev) => ({ ...prev, minimized: true }));
  const maximize = () => maximizeWindow(props.state);

  return (
    <div
      onPointerDown={(event) => props.dragControls.start(event)}
      onDoubleClick={maximize}
      className="flex select-none items-center border-b border-zinc-300 dark:border-zinc-600 bg-neutral-100 dark:bg-neutral-900"
    >
      <div className="flex-1">
        <div className="group flex gap-2 p-4" data-active={isSelected}>
          <span
            onClick={close}
            className="size-3 rounded-full border border-black/[0.06] bg-red-500 transition duration-100 active:bg-red-700 group-data-[active=false]:bg-[#ddd]"
          />
          <span
            onClick={minimize}
            className="size-3 rounded-full border border-black/[0.06] bg-yellow-500 transition duration-100 active:bg-yellow-700 group-data-[active=false]:bg-[#ddd]"
          />
          <span
            onClick={maximize}
            className="size-3 rounded-full border border-black/[0.06] bg-green-500 transition duration-100 active:bg-green-700 group-data-[active=false]:bg-[#ddd] "
          />
        </div>
      </div>
      <h1 className="font-medium">{props.title}</h1>
      <div className="flex-1">
        <div className="m-1 flex items-center justify-end">
          {props.children}
        </div>
      </div>
    </div>
  );
});

const ResizeBorder = once(function ResizeBorder(props: {
  width: MotionValue<number>;
  height: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  save: () => void;
}) {
  const { width, height, x, y } = props;

  const resizeLeft = (info: PanInfo) =>
    resizeSizePosition(width, minWidth, info.delta.x, x, info.point.x);

  const resizeRight = (info: PanInfo) =>
    resizeSize(width, minWidth, info.delta.x, x.get(), info.point.x);

  const resizeTop = (info: PanInfo) =>
    resizeSizePosition(height, minHeight, info.delta.y, y, info.point.y);

  const resizeBottom = (info: PanInfo) =>
    resizeSize(height, minHeight, info.delta.y, y.get(), info.point.y);

  return (
    <>
      <motion.div
        onPan={(event, info) => resizeLeft(info)}
        onPanEnd={props.save}
        className="absolute left-0 top-0 h-full w-px cursor-w-resize"
      />
      <motion.div
        onPan={(event, info) => resizeRight(info)}
        onPanEnd={props.save}
        className="absolute right-0 top-0 h-full w-px cursor-e-resize"
      />
      <motion.div
        onPan={(event, info) => resizeTop(info)}
        onPanEnd={props.save}
        className="absolute top-0 h-px w-full cursor-n-resize"
      />
      <motion.div
        onPan={(event, info) => resizeBottom(info)}
        onPanEnd={props.save}
        className="absolute bottom-0 h-px w-full cursor-s-resize"
      />
      <motion.div
        onPan={(event, info) => {
          resizeTop(info);
          resizeLeft(info);
        }}
        onPanEnd={props.save}
        className="absolute left-0 top-0 size-2 cursor-nw-resize"
      />
      <motion.div
        onPan={(event, info) => {
          resizeTop(info);
          resizeRight(info);
        }}
        onPanEnd={props.save}
        className="absolute right-0 top-0 size-2 cursor-ne-resize"
      />
      <motion.div
        onPan={(event, info) => {
          resizeBottom(info);
          resizeRight(info);
        }}
        onPanEnd={props.save}
        className="absolute bottom-0 right-0 size-2 cursor-se-resize"
      />
      <motion.div
        onPan={(event, info) => {
          resizeBottom(info);
          resizeLeft(info);
        }}
        onPanEnd={props.save}
        className="absolute bottom-0 left-0 size-2 cursor-sw-resize"
      />
    </>
  );
});

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
