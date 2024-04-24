"use client";

import App, { AppProps } from "@/components/App";
import { Save } from "lucide-react";
import { useRef } from "react";

export default function Notepad(props: AppProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <App
      name="Notepad"
      {...props}
      headerLeft={
        <button
          onClick={() => {
            if (ref.current && ref.current.value !== "") {
              const a = document.createElement("a");
              a.href = URL.createObjectURL(
                new Blob([ref.current.value], { type: "text/plain" }),
              );
              a.download = "untilted.txt";
              a.click();
              URL.revokeObjectURL(a.href);
            }
          }}
          className="rounded-md p-1.5 hover:bg-neutral-800"
        >
          <Save color="white" />
        </button>
      }
    >
      <textarea
        ref={ref}
        className="flex-1 resize-none border-0 font-mono outline-none"
      />
    </App>
  );
}

Notepad.appName = "Notepad";