import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const STEPS = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
    title: "Meet Nova",
    body: "Your real-time AI voice companion. Natural conversation, instant responses, always listening.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ),
    title: "Just Speak",
    body: 'Click Speak or say "Hey Nova" to activate. Nova responds instantly with voice and text.',
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Persistent Memory",
    body: "Conversations are saved locally. Nova remembers context across sessions.",
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
    title: "Share Images",
    body: "Drag any image into the panel. Nova will analyze and discuss it with you.",
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);

  return (
    <motion.div className="onboarding-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="onboarding-card"
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="onboarding-step"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="onboarding-icon">{STEPS[step].icon}</div>
            <h2>{STEPS[step].title}</h2>
            <p>{STEPS[step].body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`ob-dot ${i === step ? "active" : ""}`} onClick={() => setStep(i)} />
          ))}
        </div>

        <div className="onboarding-actions">
          {step < STEPS.length - 1
            ? <button className="ob-btn primary" onClick={() => setStep(s => s + 1)}>Continue</button>
            : <button className="ob-btn primary" onClick={onDone}>Get Started</button>
          }
          <button className="ob-btn ghost" onClick={onDone}>Skip</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
