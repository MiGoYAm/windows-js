import { DragControls } from "framer-motion";
import { PrimitiveAtom } from "jotai";

export type WindowProps = { state: PrimitiveAtom<AppWindow> };
export type AppProps = WindowProps & { dragControls: DragControls };

export type AppWindow = {
  minimized: boolean;
  maximized: boolean;
  zIndex?: number;
  readonly app: AppComponent;
};

export type AppComponent = React.FC<AppProps> & {
  appName: string;
  icon?: React.ReactNode;
  customTitleBar?: boolean;
  minWidth?: number;
  minHeight?: number;
};

export type App = {
  maximized: boolean;
  lastPosition: { x: number; y: number } | null;
  lastSize: { width: number; height: number };
};
