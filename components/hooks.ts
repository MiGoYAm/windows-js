import { useAtomValue, useSetAtom } from "jotai";
import { selectAtom, useAtomCallback } from "jotai/utils";
import { Atom, atom, type Getter, type Setter } from "jotai/vanilla";
import { DependencyList, useCallback, useLayoutEffect, useMemo } from "react";

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

export const browserWindowAtom = atom<{ width: number; height: number } | null>(
  null,
);

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
