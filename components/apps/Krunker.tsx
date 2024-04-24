"use client";

import App, { AppProps } from "@/components/App";

export default function Krunker(props: AppProps) {
  return (
    <App name="Krunker" {...props}>
      <iframe src="https://krunker.io" className="flex-1"></iframe>
    </App>
  );
}

Krunker.appName = "Krunker";
