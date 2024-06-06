import { memo } from "react";

export function once<P>(Component: React.FunctionComponent<P>) {
    return memo(Component, () => true)
}