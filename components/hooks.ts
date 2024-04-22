import { useAtomCallback } from "jotai/utils";
import type { Getter, Setter } from "jotai/vanilla";
import {
  DependencyList,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export function useNotReactiveAtom<Result>(
  callback: (get: Getter, set: Setter) => Result,
  deps: DependencyList = [],
): Result {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(useAtomCallback(useCallback(callback, deps)), deps);
}

export function useWindowSize() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
}
