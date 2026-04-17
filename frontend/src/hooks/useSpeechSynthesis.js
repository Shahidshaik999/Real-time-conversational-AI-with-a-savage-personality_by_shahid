import { useState, useCallback, useRef, useEffect } from "react";

export function useSpeechSynthesis({ onStart, onEnd }) {
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [voices, setVoices]             = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const utteranceRef = useRef(null);
  const resumeRef    = useRef(null);

  const loadVoices = useCallback(() => {
    const available = window.speechSynthesis.getVoices();
    if (available.length > 0) {
      setVoices(available);
      setSelectedVoice((prev) => {
        if (prev) return prev;
        return available.find((v) => v.lang.startsWith("en-US") && v.name.includes("Natural"))
          || available.find((v) => v.lang.startsWith("en-US"))
          || available.find((v) => v.lang.startsWith("en"))
          || available[0];
      });
    }
  }, []);

  // Load voices on mount and on voiceschanged
  useEffect(() => {
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [loadVoices]);

  // Chrome bug fix: speechSynthesis pauses after ~15s — keep it alive
  const keepAlive = useCallback(() => {
    clearInterval(resumeRef.current);
    resumeRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(resumeRef.current);
      }
    }, 10000);
  }, []);

  const speak = useCallback((text) => {
    if (!text?.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    clearInterval(resumeRef.current);

    // Small delay after cancel to avoid Chrome glitch
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate  = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
        keepAlive();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        clearInterval(resumeRef.current);
        onEnd?.();
      };

      utterance.onerror = (e) => {
        // Ignore "interrupted" errors — those are from cancel()
        if (e.error === "interrupted") return;
        console.warn("Speech error:", e.error);
        setIsSpeaking(false);
        clearInterval(resumeRef.current);
        onEnd?.();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [selectedVoice, onStart, onEnd, keepAlive]);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    clearInterval(resumeRef.current);
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, cancel, voices, selectedVoice, setSelectedVoice, loadVoices };
}
