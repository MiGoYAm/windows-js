"use client";

import { Save } from "lucide-react";
import { useEffect, useRef } from "react";
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

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <>
      <TitleBar title="Notepad" {...props}>
        <button
          onClick={save}
          className="rounded-md p-1.5 transition hover:bg-neutral-300 dark:hover:bg-neutral-800"
        >
          <Save />
        </button>
      </TitleBar>

      <textarea
        ref={ref}
        className="flex-1 resize-none border-0 bg-transparent p-2 font-mono outline-none"
      />
    </>
  );
}

Notepad.appName = "Notepad";
Notepad.customTitleBar = true;
Notepad.icon = <NotepadIcon className="size-3/5" />;
