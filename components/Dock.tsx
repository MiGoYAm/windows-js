"use client";

import { atom, useAtom, useSetAtom } from "jotai";
import { AppWindow, Visibility, openAppAtom, windowsAtom } from "./App";
import {
  AnimatePresence,
  MotionValue,
  Reorder,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import React, { RefObject, useMemo, useRef } from "react";
import Notepad from "./Notepad";
import Camera from "./Camera";

const visibilityWindowAtom = atom(null, (get, set, app: AppWindow["app"], visibility: Visibility ) => {
  const windows = [...get(windowsAtom)];
  const index = windows.findIndex((w) => w.app === app)
  windows[index] = { app, visibility }
  set(windowsAtom, windows)
});

const maxWindow = atom(null, (get, set, app: AppWindow["app"]) => {
  const windows = [...get(windowsAtom)];
  const index = windows.findIndex((w) => w.app === app)
  windows[index] = { app, visibility: "minimized"}
  set(windowsAtom, windows)
});

const openedAppSetAtom = atom((get) => {
  return new Set(get(windowsAtom))
})
const pinnedAppsAtom = atom<AppWindow["app"][]>([Notepad, Camera]);

export default function Dock() {
  const [pinnedApps, setPinnedApps] = useAtom(pinnedAppsAtom);
  //const [apps, setApps] = useAtom(opendedAppsAtom);

  const dragContraints = useRef(null);

  const mouseX = useMotionValue<number>(Infinity);

  return (
    <motion.div
      ref={dragContraints}
      layout
      className="fixed bottom-0 left-0 right-0 mx-auto flex h-20 w-fit rounded-2xl bg-white/20 p-2"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <AppList
        apps={pinnedApps}
        setApps={setPinnedApps}
        mouseX={mouseX}
        dragContraints={dragContraints}
      />
      {/* {apps.length > 0 && (
        <>
          <div className="mx-2 h-14 w-px self-center bg-slate-400" />
          <AppList
            apps={apps}
            setApps={setApps}
            mouseX={mouseX}
            dragContraints={dragContraints}
          />
        </>
      )} */}
    </motion.div>
  );
}

function AppList(props: {
  apps: AppWindow["app"][];
  setApps: (apps: AppWindow["app"][]) => void;
  mouseX: MotionValue<number>;
  dragContraints: RefObject<Element>;
}) {
  return (
    <AnimatePresence>
      <Reorder.Group
        axis="x"
        values={props.apps}
        onReorder={props.setApps}
        className="flex items-end gap-3"
      >
        {props.apps.map((app) => (
          <AppIcon
            app={app}
            key={app.name}
            mouseX={props.mouseX}
            dragContraints={props.dragContraints}
          />
        ))}
      </Reorder.Group>
    </AnimatePresence>
  );
}

function AppIcon(props: {
  app: AppWindow["app"];
  mouseX: MotionValue<number>;
  dragContraints: RefObject<Element>;
}) {
  const ref = useRef<HTMLLinkElement>(null);

  const [windows] = useAtom(windowsAtom);
  const openApp = useSetAtom(openAppAtom);
  const setWindowVisibility = useSetAtom(visibilityWindowAtom)
  const openedWindows = useMemo(
    () => windows.filter((window) => window.app === props.app),
    [windows, props.app],
  );

  const distance = useTransform(props.mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return x - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [64, 128, 64]);
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const dotWidth = useTransform(width, [64, 128], [6, 48]);

  return (
    <Reorder.Item
      ref={ref}
      value={props.app}
      style={{ originY: 1, width, height: width, borderRadius: "18.75%" }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      onTap={() => {
        if (openedWindows.length === 0) {
          openApp(props.app);
        } else if (openedWindows.length === 1) {
          const visibility = openedWindows[0].visibility
          if (visibility === "minimized") {
            setWindowVisibility(props.app, "floating")
          } else {
            setWindowVisibility(props.app, "minimized")
          }

        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      dragConstraints={props.dragContraints}
      className="relative flex size-16 items-center justify-center bg-white text-sm"
    >
      <p>{props.app.appName}</p>
      {openedWindows.length > 0 && (
        <motion.div
          style={{ width: dotWidth }}
          className="absolute -bottom-[7px] size-[6px] rounded-full bg-slate-300"
        />
      )}
    </Reorder.Item>
  );
}
