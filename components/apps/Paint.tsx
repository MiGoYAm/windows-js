import { useEffect, useRef, useState } from "react";

export default function Paint() {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [dimensions, setDimensions] = useState({} as any);

  useEffect(() => {
    const element = ref.current as HTMLCanvasElement;
    const ctx = element.getContext("2d") as CanvasRenderingContext2D;

    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.borderBoxSize) {
        const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];

        setDimensions({ width, height });
        ctx.restore();
      }
    });

    observer.observe(element);

    function handlePointerDown(event: PointerEvent) {
      const rect = element.getBoundingClientRect();
      ctx?.beginPath();
      ctx.lineCap = "round";
      ctx.lineWidth = 5 * event.pressure;
      ctx?.moveTo(event.clientX - rect.x, event.clientY - rect.y);
      drawing.current = true;
    }
    function handlePointerMove(event: PointerEvent) {
      if (!drawing.current) return;
      const rect = element.getBoundingClientRect();
      ctx.lineWidth = 5 * event.pressure;
      ctx?.lineTo(event.clientX - rect.x, event.clientY - rect.y);
      ctx?.stroke();
    }
    function handlePointerUp(event: PointerEvent) {
      ctx?.stroke();
      ctx.save();
      drawing.current = false;
    }

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return <canvas ref={ref} className="flex-1 bg-white" {...dimensions} />;
}

Paint.appName = "Paint";
