import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatLog({ messages, transcript, isListening, streamingText, onClear }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, transcript]);

  return (
    <div className="chat-panel">
      {/* Chat header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <span className="chat-title">Conversation</span>
          {messages.length > 0 && (
            <span className="chat-count">{messages.length}</span>
          )}
        </div>
        {messages.length > 0 && (
          <button className="clear-btn" onClick={onClear}>Clear</button>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && !streamingText && !transcript && (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p>Start speaking to begin your conversation with Nova.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`msg-row ${msg.role}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {msg.role === "assistant" && (
                <div className="msg-avatar-dot" />
              )}
              <div className={`msg-bubble ${msg.role}`}>
                <span className="msg-sender">{msg.role === "user" ? "You" : "Nova"}</span>
                <p className="msg-text">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming */}
        {streamingText && (
          <motion.div className="msg-row assistant" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="msg-avatar-dot" />
            <div className="msg-bubble assistant">
              <span className="msg-sender">Nova</span>
              <p className="msg-text">{streamingText}<span className="cursor" /></p>
            </div>
          </motion.div>
        )}

        {/* Live transcript */}
        {isListening && transcript && (
          <motion.div className="msg-row user live" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="msg-bubble user">
              <span className="msg-sender">You</span>
              <p className="msg-text">{transcript}<span className="cursor" /></p>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
