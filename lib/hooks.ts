import { useAtomValue, useSetAtom } from "jotai";
import { selectAtom, useAtomCallback } from "jotai/utils";
import { atom, type Getter, type Setter } from "jotai/vanilla";
import {
  DependencyList,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

export function useNotReactiveAtom<Result>(
  callback: (get: Getter, set: Setter) => Result,
  deps: DependencyList = [],
): Result {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(useAtomCallback(useCallback(callback, deps)), deps);
}

export function useSelectAtom<Value, Slice>(
  ...params: Parameters<typeof selectAtom<Value, Slice>>
) {
  return useAtomValue(selectAtom<Value, Slice>(...params));
}

export const [browserWindowAtom, useWindowListener] = atomWithListeners<{
  width: number;
  height: number;
} | null>(null);

export function useWindowSize() {
  const setSize = useSetAtom(browserWindowAtom);

  useLayoutEffect(() => {
    const handleResize = () =>
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

type Callback<Value> = (
  get: Getter,
  set: Setter,
  newVal: Value,
  prevVal: Value,
) => void;

export function atomWithListeners<Value>(initialValue: Value) {
  const baseAtom = atom(initialValue);
  const listenersAtom = atom<Callback<Value>[]>([]);
  const anAtom = atom(
    (get) => get(baseAtom),
    (get, set, arg: SetStateAction<Value>) => {
      const prevVal = get(baseAtom);
      set(baseAtom, arg);
      const newVal = get(baseAtom);
      get(listenersAtom).forEach((callback) => {
        callback(get, set, newVal, prevVal);
      });
    },
  );
  const useListener = (callback: Callback<Value>) => {
    const setListeners = useSetAtom(listenersAtom);
    useEffect(() => {
      setListeners((prev) => [...prev, callback]);
      return () =>
        setListeners((prev) => {
          const index = prev.indexOf(callback);
          return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
    }, [setListeners, callback]);
  };
  return [anAtom, useListener] as const;
}

