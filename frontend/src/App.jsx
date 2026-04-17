import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Avatar3D from "./components/Avatar3D";
import Controls from "./components/Controls";
import ChatLog from "./components/ChatLog";
import Waveform from "./components/Waveform";
import Onboarding from "./components/Onboarding";
import ImageDrop from "./components/ImageDrop";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { useAudioLevel } from "./hooks/useAudioLevel";
import { useWakeWord } from "./hooks/useWakeWord";

const API_BASE       = "/api";
const STORAGE_KEY    = "avatar_chat_history_v2";
const ONBOARD_KEY    = "avatar_onboarded";
const MAX_HISTORY    = 20;
const SUMMARIZE_AT   = 10;

function detectEmotion(text) {
  const t = text.toLowerCase();
  if (/\b(great|awesome|love|happy|wonderful|excited|fantastic|yay|glad|haha|lol)\b/.test(t)) return "happy";
  if (/\b(sorry|sad|unfortunate|regret|miss|hard|difficult|tough|unfortunately)\b/.test(t)) return "sad";
  if (/\b(wow|really|seriously|wait|what|oh|surprising|unexpected|whoa)\b/.test(t)) return "surprised";
  if (/\b(hmm|let me|think|consider|actually|well|interesting|perhaps|maybe)\b/.test(t)) return "thinking";
  return "neutral";
}

function exportChat(messages) {
  const lines = messages.map((m) =>
    `[${m.role === "user" ? "You" : "Nova"}]: ${m.content}`
  ).join("\n\n");
  const blob = new Blob([lines], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `nova-chat-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [messages,     setMessages]     = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });
  const [isLoading,    setIsLoading]    = useState(false);
  const [streamingText,setStreaming]    = useState("");
  const [personality,  setPersonality]  = useState("friendly");
  const [emotion,      setEmotion]      = useState("neutral");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeEnabled,  setWakeEnabled]  = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const continuousModeRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => { continuousModeRef.current = continuousMode; }, [continuousMode]);
  const [showOnboard,  setShowOnboard]  = useState(() => !localStorage.getItem(ONBOARD_KEY));
  const [pendingImage, setPendingImage] = useState(null);
  const isInterruptedRef = useRef(false);
  const summarizedRef    = useRef(false);

  // Persist history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  }, [messages]);

  const { level: audioLevel, analyser, start: startAudio, stop: stopAudio } = useAudioLevel();

  const { isSpeaking, speak, cancel, voices, selectedVoice, setSelectedVoice, loadVoices } =
    useSpeechSynthesis({
      onStart: () => {},
      onEnd:   () => {
        setEmotion("neutral");
        // Auto-restart listening if continuous mode is on
        if (continuousModeRef.current && !isLoading) {
          setTimeout(() => {
            if (!isListening) handleStart();
          }, 800);
        }
      },
    });

  useEffect(() => { loadVoices(); }, [loadVoices]);

  // Auto-summarize after SUMMARIZE_AT messages
  const maybeSummarize = useCallback(async (msgs) => {
    if (msgs.length < SUMMARIZE_AT || summarizedRef.current) return msgs;
    summarizedRef.current = true;
    try {
      const res = await fetch(`${API_BASE}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs }),
      });
      const { summary } = await res.json();
      // Replace history with summary context message
      return [{ role: "system-summary", content: `[Previous conversation summary: ${summary}]` }];
    } catch {
      return msgs;
    }
  }, []);

  const sendMessage = useCallback(async (userText, imageData = null) => {
    if (!userText.trim() && !imageData) return;

    let currentMessages = messages.slice(-MAX_HISTORY);
    if (currentMessages.length >= SUMMARIZE_AT && !summarizedRef.current) {
      currentMessages = await maybeSummarize(currentMessages);
      setMessages(currentMessages);
    }

    const userMsg = imageData
      ? { role: "user", content: userText || "What's in this image?", image: imageData }
      : { role: "user", content: userText };

    const newMessages = [...currentMessages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    setStreaming("");
    setEmotion("thinking");
    isInterruptedRef.current = false;
    setPendingImage(null);

    try {
      const endpoint = imageData ? `${API_BASE}/vision` : `${API_BASE}/chat/stream`;
      const body     = imageData
        ? JSON.stringify({ text: userText || "Describe this image", image: imageData, personality })
        : JSON.stringify({ messages: newMessages.filter(m => m.role !== "system-summary"), personality });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error("API error");

      let fullText = "";

      if (imageData) {
        const data = await res.json();
        fullText = data.reply || "";
        setStreaming(fullText);
      } else {
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          if (isInterruptedRef.current) { reader.cancel(); break; }
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) { fullText += parsed.delta; setStreaming(fullText); }
            } catch {}
          }
        }
      }

      if (!isInterruptedRef.current && fullText) {
        const det = detectEmotion(fullText);
        setEmotion(det);
        setStreaming("");
        setMessages((prev) => [...prev, { role: "assistant", content: fullText, emotion: det }]);
        speak(fullText);
      }
    } catch (err) {
      console.error(err);
      const errMsg = "Oops, something went wrong. Try again?";
      setEmotion("sad");
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg, emotion: "sad" }]);
      speak(errMsg);
    } finally {
      setIsLoading(false);
      if (isInterruptedRef.current) { setStreaming(""); setEmotion("neutral"); }
    }
  }, [messages, personality, speak, maybeSummarize]);

  const { isListening, transcript, setTranscript, start, stop } = useSpeechRecognition({
    onResult: (text) => { setTranscript(""); sendMessage(text); },
    onEnd:    () => stopAudio(),
  });

  const handleStart = useCallback(() => {
    if (isSpeaking) { isInterruptedRef.current = true; cancel(); }
    startAudio();
    start();
  }, [isSpeaking, cancel, start, startAudio]);

  const handleStop = useCallback(() => { stop(); stopAudio(); }, [stop, stopAudio]);

  // Wake word
  const { start: startWake, stop: stopWake } = useWakeWord({
    enabled: wakeEnabled,
    onWake: () => { if (!isListening && !isLoading) handleStart(); },
  });

  useEffect(() => {
    if (wakeEnabled) startWake();
    else stopWake();
  }, [wakeEnabled, startWake, stopWake]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const handleOnboardDone = () => {
    localStorage.setItem(ONBOARD_KEY, "1");
    setShowOnboard(false);
    // Avatar greets user
    setTimeout(() => {
      const greeting = "Hey there! I'm Nova, your AI companion. Just click Speak or say 'Hey Nova' to chat with me!";
      setMessages([{ role: "assistant", content: greeting, emotion: "happy" }]);
      setEmotion("happy");
      speak(greeting);
    }, 400);
  };

  const handleImage = useCallback((dataUrl) => {
    setPendingImage(dataUrl);
    sendMessage("What's in this image?", dataUrl);
  }, [sendMessage]);

  const handleClear = useCallback(() => {
    setMessages([]);
    summarizedRef.current = false;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <div className={`app ${isFullscreen ? "fullscreen" : ""}`}>
      <AnimatePresence>
        {showOnboard && <Onboarding onDone={handleOnboardDone} />}
      </AnimatePresence>

      {/* LEFT — avatar + controls panel */}
      <div className="panel-left">
        <Avatar3D
          isSpeaking={isSpeaking}
          isListening={isListening}
          emotion={emotion}
          audioLevel={audioLevel}
        />

        <Waveform
          analyserNode={analyser}
          isActive={isListening}
          color={isListening ? "#34d399" : "#6366f1"}
        />

        <AnimatePresence>
          {isLoading && !streamingText && (
            <motion.div
              className="thinking-indicator"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <span className="dot" /><span className="dot" /><span className="dot" />
            </motion.div>
          )}
        </AnimatePresence>

        <Controls
          isListening={isListening}
          isSpeaking={isSpeaking}
          isLoading={isLoading}
          onStart={handleStart}
          onStop={handleStop}
          onTextSend={sendMessage}
          personality={personality}
          onPersonalityChange={setPersonality}
          voices={voices}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          wakeWordActive={wakeEnabled}
          onToggleWakeWord={() => setWakeEnabled((v) => !v)}
          continuousMode={continuousMode}
          onToggleContinuous={() => setContinuousMode((v) => !v)}
          onExport={() => exportChat(messages)}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          messageCount={messages.length}
        />

        <ImageDrop onImage={handleImage} disabled={isLoading} />
      </div>

      {/* RIGHT — chat panel */}
      <div className="panel-right">
        <ChatLog
          messages={messages}
          transcript={transcript}
          isListening={isListening}
          streamingText={streamingText}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}
