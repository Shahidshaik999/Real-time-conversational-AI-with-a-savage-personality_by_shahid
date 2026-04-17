import { useRef, useEffect } from "react";

export default function Waveform({ analyserNode, isActive, color = "#6366f1" }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode || !isActive) {
      cancelAnimationFrame(rafRef.current);
      // Clear canvas
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx    = canvas.getContext("2d");
    const data   = new Uint8Array(analyserNode.frequencyBinCount);
    const W      = canvas.width;
    const H      = canvas.height;

    const draw = () => {
      analyserNode.getByteTimeDomainData(data);
      ctx.clearRect(0, 0, W, H);

      ctx.lineWidth   = 2.5;
      ctx.strokeStyle = color;
      ctx.shadowBlur  = 8;
      ctx.shadowColor = color;
      ctx.beginPath();

      const sliceW = W / data.length;
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * H) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserNode, isActive, color]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={60}
      className="waveform-canvas"
      style={{ opacity: isActive ? 1 : 0, transition: "opacity 0.3s" }}
    />
  );
}
