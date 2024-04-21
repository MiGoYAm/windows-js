"use client";

import App from "@/components/App";
import { useEffect, useRef, useState } from "react";

export default function Camera() {
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

  return (
    <App name="Camera">
      <div className="flex flex-1 max-h-full justify-center items-center">
        {error ? (
          <p className="text-white text-center">
            Wystąpił błąd w trakcie inicjalizacji kamery
          </p>
        ) : (
          <video
            className="object-contain h-full w-full"
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
