import { PrimitiveAtom, atom } from "jotai";
import { type App, AppWindow, AppComponent } from "@/lib/types";
import { browserWindowAtom } from "./hooks";
import { atomFamily, atomWithDefault, splitAtom } from "jotai/utils";
import Settings from "@/components/apps/Settings";

export const appAtomFamily = atomFamily((name: string) => {
  return atomWithDefault<App>((get) => {
    const size = 512;
    const browserWindow = get(browserWindowAtom);

    const width = Math.min(size, browserWindow?.width ?? size);
    const height = Math.min(size, browserWindow?.height ?? size);

    let lastPosition;

    if (browserWindow) {
      lastPosition = {
        x: (browserWindow.width - width) / 2,
        y: (browserWindow.height - height) / 2,
      };
    } else {
      lastPosition = {
        x: 0,
        y: 0,
      };
    }

    return {
      maximized: false,
      lastPosition,
      lastSize: { width, height },
    };
  });
});

export const windowsAtom = atom<AppWindow[]>([
  {
    app: Settings,
    maximized: false,
    minimized: false,
    zIndex: 10,
  },
]);

export const windowAtomsAtom = splitAtom(windowsAtom);

export const openAppAtom = atom(null, (get, set, app: AppComponent) => {
  const appState = get(appAtomFamily(app.appName));
  const zIndex = get(zIndexAtom) + 1;
  set(zIndexAtom, zIndex);

  set(windowsAtom, (prev) => [
    ...prev,
    {
      app,
      maximized: appState.maximized,
      zIndex,
      minimized: false,
    },
  ]);
});

export const closeWindowAtom = atom(
  null,
  (get, set, atom: PrimitiveAtom<AppWindow>) => {
    set(windowAtomsAtom, { type: "remove", atom });
    console.log(
      "close",
      atom.toString(),
      get(windowAtomsAtom).map((a) => a.toString()),
    );
  },
);

export const maximizeWindowAtom = atom(
  null,
  (get, set, atom: PrimitiveAtom<AppWindow>) => {
    const window = get(atom);
    set(atom, { ...window, maximized: !window.maximized });
    set(appAtomFamily(window.app.appName), (prev) => ({
      ...prev,
      maximized: !window.maximized,
    }));
  },
);

export const selectWindowAtom = atom(
  null,
  (get, set, atom: PrimitiveAtom<AppWindow>) => {
    const window = get(atom);
    let zIndex = get(zIndexAtom);

    if (zIndex !== window.zIndex) {
      zIndex += 1;
      set(zIndexAtom, zIndex);
      set(atom, { ...window, zIndex });
    }
  },
);

export const zIndexAtom = atom(10);
