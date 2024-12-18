"use client";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  AnimatePresence,
  MotionValue,
  Reorder,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import React, { RefObject, useCallback, useRef } from "react";
import Notepad from "./apps/Notepad";
import Camera from "./apps/Camera";
import Krunker from "./apps/Krunker";
import { useSelectAtom } from "../lib/hooks";
import { PrimitiveAtom } from "jotai/vanilla";
import { AppComponent, AppWindow } from "@/lib/types";
import {
  openAppAtom,
  selectWindowAtom,
  windowAtomsAtom,
  zIndexAtom,
} from "@/lib/atoms";
import Settings from "./apps/Settings";
import Gallery from "./apps/Gallery";

const toggleVisibilityAtom = atom(
  null,
  (get, set, atom: PrimitiveAtom<AppWindow>) => {
    const zIndex = get(zIndexAtom);
    const window = get(atom);
    if (window.zIndex === zIndex) {
      set(atom, {
        ...window,
        minimized: !window.minimized,
      });
    } else {
      set(selectWindowAtom, atom);
      if (window.minimized) {
        set(atom, (prev) => ({ ...prev, minimized: false }));
      }
    }
  },
);

const pinnedAppsAtom = atom<AppComponent[]>([
  Notepad,
  Camera,
  Krunker,
  Gallery,
  Settings,
]);

const groupedAppsAtom = atom((get) => {
  const windowAtoms = get(windowAtomsAtom);
  //return {} as Partial<Record<string, PrimitiveAtom<AppWindow>[]>>;
  return Object.groupBy(windowAtoms, (w) => get(w).app.appName);
});

export default function Dock() {
  const dragContraints = useRef<HTMLDivElement>(null as any);
  const blockAnimation = useRef(false);
  const mouseX = useMotionValue<number>(Infinity);

  return (
    <motion.div
      ref={dragContraints}
      layout
      className="fixed bottom-0 left-0 right-0 z-[2147483647] mx-auto flex h-20 w-fit rounded-2xl bg-white/10 p-2 text-black shadow-lg backdrop-blur-lg dark:bg-black/10"
      onMouseMove={(e) => {
        if (blockAnimation.current) return;
        mouseX.set(e.clientX);
      }}
      onMouseLeave={() => {
        if (blockAnimation.current) return;
        mouseX.set(Infinity);
      }}
    >
      <AppList
        atom={pinnedAppsAtom}
        blockAnimation={blockAnimation}
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
  atom: PrimitiveAtom<AppComponent[]>;
  blockAnimation: RefObject<boolean>;
  mouseX: MotionValue<number>;
  dragContraints: RefObject<Element>;
}) {
  const [apps, setApps] = useAtom(props.atom);

  return (
    <AnimatePresence>
      <Reorder.Group
        axis="x"
        values={apps}
        onReorder={setApps}
        className="flex items-end gap-3"
      >
        {apps.map((app) => (
          <AppIcon
            app={app}
            key={app.name}
            blockAnimation={props.blockAnimation}
            mouseX={props.mouseX}
            dragContraints={props.dragContraints}
          />
        ))}
      </Reorder.Group>
    </AnimatePresence>
  );
}

function AppIcon(props: {
  app: AppComponent;
  blockAnimation: RefObject<boolean>;
  mouseX: MotionValue<number>;
  dragContraints: RefObject<Element>;
}) {
  const ref = useRef<HTMLLIElement>(null);

  const openApp = useSetAtom(openAppAtom);
  const toggleWindowVisibility = useSetAtom(toggleVisibilityAtom);

  const openedWindows = useSelectAtom(
    groupedAppsAtom,
    useCallback(
      (apps) => apps[props.app.appName] ?? [],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    ),
  );

  const distance = useTransform(props.mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return 0;
    return x - bounds.x - bounds.width / 2;
  });

  const scaleSync = useTransform(distance, [-150, 0, 150], [1, 2, 1]);
  const scale = useSpring(scaleSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const size = useTransform(scale, (x) => x * 64);
  const dotWidth = useTransform(scale, (x) => x * 12);

  return (
    <Reorder.Item
      ref={ref}
      value={props.app}
      style={{ originY: 1, width: size, height: size, borderRadius: "18.75%" }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      onTap={() => {
        if (openedWindows.length === 0) {
          openApp(props.app);
        } else if (openedWindows.length === 1) {
          toggleWindowVisibility(openedWindows[0]);
        }
      }}
      onContextMenu={(e: any) => {
        e.preventDefault();
        openApp(props.app);
        //props.blockAnimation.current = true;
      }}
      dragConstraints={props.dragContraints}
      className="relative flex size-16 items-center justify-center bg-white text-sm shadow-md"
    >
      {props.app.icon ? (
        props.app.icon
      ) : (
        <motion.p style={{ scale }}>{props.app.appName}</motion.p>
      )}
      <AnimatePresence>
        {openedWindows.length > 0 && (
          <motion.div
            style={{ width: dotWidth }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-[6px] size-[4px] rounded-full bg-slate-300"
          />
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}
