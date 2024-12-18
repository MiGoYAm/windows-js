"use client";

import { useEffect, useRef, useState } from "react";
import { Camera as CameraIcon, Video } from "lucide-react";
import Image from "next/image";
import Gallery, { images } from "./Gallery";
import { openAppAtom } from "@/lib/atoms";
import { useSetAtom } from "jotai";
import { AppComponent } from "@/lib/types";

export default function Camera() {
  const [error, setError] = useState(null);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [camera, setCamera] = useState(false);

  const openApp = useSetAtom(openAppAtom);

  const mediaRecorder = useRef<MediaRecorder>(null);
  const canvas = useRef<OffscreenCanvas>(null);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        stream = s;
        ref.current!.srcObject = stream;

        const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        let data: Blob | undefined = undefined;

        recorder.ondataavailable = (event) => (data = event.data);
        recorder.onstart = () => setRecording(true);
        recorder.onstop = () => {
          setRecording(false);
          if (!data) return;

          const url = URL.createObjectURL(data);
          data = undefined;
        };
        recorder.onerror = (event: any) => setError(event.name);

        mediaRecorder.current = recorder;
      })
      .catch((err) => setError(err));

    return () => {
      stream?.getTracks().forEach((track) => {
        stream!.removeTrack(track);
        track.stop();
      });
    };
  }, []);

  function takePhoto() {
    if (!ref.current || !canvas.current) return;

    const context = canvas.current.getContext("2d")!;

    context.drawImage(
      ref.current,
      0,
      0,
      canvas.current.width,
      canvas.current.height,
    );

    canvas.current.convertToBlob().then((blob) => {
      const url = URL.createObjectURL(blob);
      setLastImage(url);
      images.push(url);
    });
  }

  const [recording, setRecording] = useState(false);

  function handleClick() {
    if (camera) {
      if (mediaRecorder.current?.state === "inactive") {
        mediaRecorder.current.start();
      } else {
        mediaRecorder.current?.stop();
      }
    } else {
      takePhoto();
    }
  }

  return (
    <div className="relative flex flex-1 items-center justify-center bg-black">
      {error ? (
        <p className="text-center">
          Wystąpił błąd w trakcie inicjalizacji kamery
        </p>
      ) : (
        <>
          <video
            className="absolute inset-0 h-full w-full object-contain"
            autoPlay
            playsInline
            disablePictureInPicture
            muted
            ref={ref}
            onCanPlay={() => {
              const video = ref.current!;
              const { videoWidth, videoHeight } = video;
              video.width = videoWidth;
              video.height = videoHeight;
              canvas.current = new OffscreenCanvas(videoWidth, videoHeight);
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6 bg-black/30 p-4">
            <div className="flex flex-1 items-center justify-end">
              {lastImage && (
                <Image
                  src={lastImage}
                  width={44}
                  height={44}
                  alt=""
                  className="size-11 rounded-full border-2 border-white object-cover"
                  onClick={() => {
                    const app: AppComponent = (props) => (
                      <Gallery {...props} initialImage={lastImage} />
                    );
                    app.appName = Gallery.appName;
                    app.icon = Gallery.icon;

                    openApp(app);
                  }}
                />
              )}
            </div>
            <button
              className={`group rounded-full border-4 border-white p-1 shadow-lg transition hover:scale-105`}
              onClick={(e) => {
                handleClick();
              }}
            >
              <div
                className={`size-12 transition-all group-active:scale-90 ${camera ? "bg-red-600" : "bg-white"} ${camera && recording ? "scale-[0.6] rounded-xl" : "rounded-[50%]"}`}
              />
            </button>
            <div className="flex flex-1 items-center justify-end text-white">
              <button
                disabled={!camera}
                onClick={() => setCamera(false)}
                className="rounded-l-lg border-r border-neutral-400 bg-neutral-800/70 p-1.5 transition disabled:bg-neutral-500/70"
              >
                <CameraIcon />
              </button>
              <button
                disabled={camera}
                onClick={() => setCamera(true)}
                className="rounded-r-lg bg-neutral-800/70 p-1.5 transition disabled:bg-neutral-500/70"
              >
                <Video />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

Camera.appName = "Camera";
Camera.icon = <CameraIcon className="size-3/5" />;
