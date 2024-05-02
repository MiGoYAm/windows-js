"use client";

import { useEffect, useRef, useState } from "react";
import { Camera as CameraIcon } from "lucide-react";

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
  );
}

Camera.appName = "Camera";
Camera.icon = <CameraIcon className="size-4/5" />;
