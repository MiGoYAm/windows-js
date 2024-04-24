"use client";

import App, { AppProps } from "@/components/App";
import { useEffect, useRef, useState } from "react";

export default function Camera(props: AppProps) {
  const [error, setError] = useState(null);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        ref.current!.srcObject = s;
        stream = s;
      })
      .catch((err) => setError(err));

    return () => {
      stream?.getTracks().forEach((track) => {
        stream!.removeTrack(track);
        track.stop();
      });
    };
  }, []);

  useEffect(() => {
    console.log("camera rerender");
  });

  return (
    <App name="Camera" {...props}>
      <div className="flex-1 items-center justify-center">
        {error ? (
          <p className="text-center text-white">
            Wystąpił błąd w trakcie inicjalizacji kamery
          </p>
        ) : (
          <video
            className="h-full w-full object-contain"
            autoPlay
            playsInline
            disablePictureInPicture
            ref={ref}
          />
        )}
      </div>
    </App>
  );
}

Camera.appName = "Camera";
