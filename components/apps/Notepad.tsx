"use client";

import { Save } from "lucide-react";
import { useRef } from "react";
import { NotebookText as NotepadIcon } from "lucide-react";
import { AppProps } from "@/lib/types";
import { TitleBar } from "../App";

export default function Notepad(props: AppProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function save() {
    if (!ref.current || ref.current.value === "") {
      return;
    }

    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([ref.current.value], { type: "text/plain" }),
    );
    a.download = "untilted.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <TitleBar title="Notepad" {...props}>
        <button
          onClick={save}
          className="rounded-md p-1.5 hover:bg-neutral-300 dark:hover:bg-neutral-800 transition"
        >
          <Save />
        </button>
      </TitleBar>

      <textarea
        ref={ref}
        className="flex-1 resize-none p-2 border-0 font-mono outline-none bg-transparent"
      />
    </>
  );
}

Notepad.appName = "Notepad";
Notepad.customTitleBar = true;
Notepad.icon = <NotepadIcon className="size-3/5" />;
