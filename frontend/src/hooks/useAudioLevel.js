import { useState, useRef, useCallback } from "react";

export function useAudioLevel() {
  const [level,   setLevel]   = useState(0);
  const [analyser, setAnalyser] = useState(null);
  const contextRef = useRef(null);
  const sourceRef  = useRef(null);
  const rafRef     = useRef(null);
  const streamRef  = useRef(null);

  const start = useCallback(async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx      = new AudioContext();
      const source   = ctx.createMediaStreamSource(stream);
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);

      contextRef.current = ctx;
      sourceRef.current  = source;
      streamRef.current  = stream;
      setAnalyser(analyserNode);

      const data = new Uint8Array(analyserNode.frequencyBinCount);
      const tick = () => {
        analyserNode.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.min(avg / 80, 1));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn("Audio level unavailable:", e);
    }
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    sourceRef.current?.disconnect();
    contextRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setLevel(0);
    setAnalyser(null);
  }, []);

  return { level, analyser, start, stop };
}
