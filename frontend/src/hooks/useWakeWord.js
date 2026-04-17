import { useRef, useCallback, useState } from "react";

const WAKE_PHRASES = ["hey nova", "hey avatar", "ok nova", "nova"];

export function useWakeWord({ onWake, enabled }) {
  const recognitionRef = useRef(null);
  const [active, setActive] = useState(false);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !enabled) return;

    const r = new SR();
    r.continuous   = true;
    r.interimResults = true;
    r.lang         = "en-US";

    r.onresult = (e) => {
      const text = Array.from(e.results)
        .map((res) => res[0].transcript.toLowerCase())
        .join(" ");

      if (WAKE_PHRASES.some((phrase) => text.includes(phrase))) {
        onWake?.();
      }
    };

    r.onend = () => {
      // Auto-restart to keep listening
      if (active) {
        try { r.start(); } catch {}
      }
    };

    r.onerror = () => {};

    recognitionRef.current = r;
    setActive(true);
    try { r.start(); } catch {}
  }, [enabled, onWake, active]);

  const stop = useCallback(() => {
    setActive(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  return { start, stop, active };
}
