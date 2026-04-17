import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PERSONALITIES = [
  { id: "friendly",    label: "Friendly"     },
  { id: "serious",     label: "Serious"      },
  { id: "witty",       label: "Witty"        },
  { id: "savage",      label: "Savage 💀"    },
  { id: "toxicfriend", label: "Toxic Friend" },
  { id: "indianmom",   label: "Indian Mom"   },
  { id: "robot",       label: "Robot"        },
  { id: "girlfriend",  label: "Girlfriend"   },
];

export default function Controls({
  isListening, isSpeaking, isLoading,
  onStart, onStop, onTextSend,
  personality, onPersonalityChange,
  voices, selectedVoice, onVoiceChange,
  wakeWordActive, onToggleWakeWord,
  continuousMode, onToggleContinuous,
  onExport, onFullscreen, isFullscreen,
  messageCount,
}) {
  const [text, setText] = useState("");
  const canListen = !isSpeaking && !isLoading;

  const handleSend = () => {
    if (!text.trim()) return;
    onTextSend(text.trim());
    setText("");
  };

  return (
    <div className="controls">

      {/* Mic button */}
      <motion.button
        className={`mic-btn ${isListening ? "active" : ""}`}
        onClick={isListening ? onStop : onStart}
        disabled={!canListen && !isListening}
        whileTap={{ scale: 0.96 }}
      >
        <span className={`mic-icon-svg ${isListening ? "stop" : ""}`}>
          {isListening ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </span>
        <span>{isListening ? "Stop" : isLoading ? "Processing..." : isSpeaking ? "Interrupt" : "Hold to Speak"}</span>
      </motion.button>

      {/* Wake word */}
      <motion.button
        className={`wake-btn ${wakeWordActive ? "active" : ""}`}
        onClick={onToggleWakeWord}
        whileTap={{ scale: 0.96 }}
      >
        <span className="wake-indicator" />
        <span>{wakeWordActive ? "Hey Nova — Active" : "Enable Wake Word"}</span>
      </motion.button>

      {/* Continuous listening */}
      <motion.button
        className={`wake-btn continuous-btn ${continuousMode ? "active" : ""}`}
        onClick={onToggleContinuous}
        whileTap={{ scale: 0.96 }}
        title="When on, Nova auto-listens after every response"
      >
        <span className="wake-indicator" style={{ animation: continuousMode ? "pulse-dot 1s infinite" : "none" }} />
        <span>{continuousMode ? "Always Listening — On" : "Always Ready to Listen"}</span>
      </motion.button>

      {/* Text input */}
      <div className="text-input-row">
        <input
          className="text-input"
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={isLoading || isListening}
        />
        <motion.button
          className="send-btn"
          onClick={handleSend}
          disabled={!text.trim() || isLoading || isListening}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </motion.button>
      </div>

      {/* Divider */}
      <div className="ctrl-divider" />

      {/* Personality */}
      <div className="ctrl-group">
        <span className="ctrl-label">Personality</span>
        <div className="toggle-buttons">
          {PERSONALITIES.map((p) => (
            <motion.button
              key={p.id}
              className={`toggle-btn ${personality === p.id ? "selected" : ""}`}
              onClick={() => onPersonalityChange(p.id)}
              whileTap={{ scale: 0.95 }}
            >
              {p.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Voice */}
      {voices.length > 0 && (
        <div className="ctrl-group">
          <span className="ctrl-label">Voice</span>
          <select
            className="voice-select"
            value={selectedVoice?.name || ""}
            onChange={(e) => onVoiceChange(voices.find((v) => v.name === e.target.value))}
          >
            {voices.filter((v) => v.lang.startsWith("en")).map((v) => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Utility row */}
      <div className="util-row">
        <motion.button className="util-btn" onClick={onFullscreen} whileTap={{ scale: 0.95 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isFullscreen
              ? <><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></>
              : <><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></>
            }
          </svg>
          {isFullscreen ? "Exit" : "Fullscreen"}
        </motion.button>

        {messageCount > 0 && (
          <motion.button className="util-btn" onClick={onExport} whileTap={{ scale: 0.95 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </motion.button>
        )}
      </div>
    </div>
  );
}
