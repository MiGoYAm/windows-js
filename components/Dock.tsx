"use client";

import { atom, useAtom, useSetAtom } from "jotai";
import { opendedAppsAtom } from "./App";
import {
  AnimatePresence,
  MotionValue,
  Reorder,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { RefObject, useRef } from "react";
import Notepad from "./Notepad";
import Camera from "./Camera";

const apps: { [key: string]: React.FC } = {
  Notepad: Notepad,
  Camera: Camera,
};

export const windowsAtom = atom<React.FC[]>([Notepad, Camera]);
const pinnedAppsAtom = atom(["Notepad", "Camera"]);
const dockAppsAtom = atom((get) => {
  const openedApps = [...get(opendedAppsAtom)];
  get(pinnedAppsAtom).map((app) => {
    if (!openedApps.includes(app)) {
    }
  });
});

export default function Dock() {
  const [pinnedApps, setPinnedApps] = useAtom(pinnedAppsAtom);
  const [apps, setApps] = useAtom(opendedAppsAtom);

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
      {apps.length > 0 && (
        <>
          <div className="mx-2 h-14 w-px self-center bg-slate-400" />
          <AppList
            apps={apps}
            setApps={setApps}
            mouseX={mouseX}
            dragContraints={dragContraints}
          />
        </>
      )}
    </motion.div>
  );
}

function AppList(props: {
  apps: string[];
  setApps: (apps: string[]) => void;
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
            key={app}
            mouseX={props.mouseX}
            dragContraints={props.dragContraints}
          />
        ))}
      </Reorder.Group>
    </AnimatePresence>
  );
}

function AppIcon(props: {
  app: string;
  mouseX: MotionValue<number>;
  dragContraints: RefObject<Element>;
}) {
  const ref = useRef<HTMLLinkElement>(null);
  const setWindows = useSetAtom(windowsAtom);

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

  return (
    <Reorder.Item
      ref={ref}
      value={props.app}
      style={{ originY: 1, width, height: width, borderRadius: "18.75%" }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      onTap={() => {
        setWindows((prev) => [...prev, apps[props.app]]);
      }}
      dragConstraints={props.dragContraints}
      className="flex size-16 items-center justify-center bg-white text-sm"
    >
      <p>{props.app}</p>
    </Reorder.Item>
  );
}
