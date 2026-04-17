import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TALK_SEQ = [0.7, 0.3, 0.9, 0.2, 0.6, 0.1, 0.8, 0.2];

const EMOTION = {
  neutral:   { iris: "#c47a1a", pupil: "#1a0a00", glow: "rgba(196,122,26,0.4)",  ring: "#c47a1a" },
  happy:     { iris: "#d4921a", pupil: "#1a0a00", glow: "rgba(212,146,26,0.45)", ring: "#f59e0b" },
  sad:       { iris: "#8a6a3a", pupil: "#0a0a1a", glow: "rgba(96,130,200,0.35)", ring: "#60a5fa" },
  surprised: { iris: "#e08a10", pupil: "#0a0000", glow: "rgba(220,120,20,0.5)",  ring: "#f97316" },
  thinking:  { iris: "#7a9a3a", pupil: "#0a1a00", glow: "rgba(100,180,80,0.35)", ring: "#34d399" },
};

export default function Avatar3D({ isSpeaking, isListening, emotion = "neutral", audioLevel = 0 }) {
  const cfg = EMOTION[emotion] || EMOTION.neutral;

  const frameRef   = useRef(null);
  const pupilLRef  = useRef(null);
  const pupilRRef  = useRef(null);
  const [blinking,  setBlinking]  = useState(false);
  const [tailSide,  setTailSide]  = useState(1);
  const [mouthOpen, setMouthOpen] = useState(0);

  // Mouse → eye tracking
  useEffect(() => {
    const onMove = (e) => {
      const px = ((e.clientX / window.innerWidth)  - 0.5) * 5;
      const py = ((e.clientY / window.innerHeight) - 0.5) * 3;
      if (pupilLRef.current) {
        pupilLRef.current.setAttribute("cx", String(76  + px));
        pupilLRef.current.setAttribute("cy", String(88  + py));
      }
      if (pupilRRef.current) {
        pupilRRef.current.setAttribute("cx", String(116 + px));
        pupilRRef.current.setAttribute("cy", String(88  + py));
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Blinking
  useEffect(() => {
    let t;
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 120);
      t = setTimeout(blink, 2600 + Math.random() * 2400);
    };
    t = setTimeout(blink, 2000);
    return () => clearTimeout(t);
  }, []);

  // Tail wag — faster when speaking
  useEffect(() => {
    const t = setInterval(() => setTailSide(s => -s), isSpeaking ? 380 : 1800);
    return () => clearInterval(t);
  }, [isSpeaking]);

  // Lip-sync
  useEffect(() => {
    clearTimeout(frameRef.current);
    if (!isSpeaking) { setMouthOpen(0); return; }
    let i = 0;
    const go = () => {
      setMouthOpen(TALK_SEQ[i++ % TALK_SEQ.length]);
      frameRef.current = setTimeout(go, Math.max(70, 145 - audioLevel * 75));
    };
    go();
    return () => clearTimeout(frameRef.current);
  }, [isSpeaking, audioLevel]);

  const label    = isSpeaking ? "Speaking" : isListening ? "Listening" : emotion === "thinking" ? "Thinking" : "Idle";
  const scale    = 1 + (isSpeaking ? audioLevel * 0.06 : 0);
  const openAmt  = mouthOpen * 10;
  const mouthY   = 118;
  const mouthW   = 14;

  return (
    <div className="avatar-container">
      {/* Ambient glow */}
      <div className="avatar-glow" style={{
        background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
        opacity: isSpeaking ? 1 : 0.5
      }} />

      {/* Pulse rings */}
      <AnimatePresence>
        {(isSpeaking || isListening) && (<>
          <motion.div className="pulse-ring"
            style={{ borderColor: cfg.ring + "66" }}
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut" }} />
          <motion.div className="pulse-ring"
            style={{ borderColor: cfg.ring + "40" }}
            initial={{ scale: 0.9, opacity: 0.45 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut", delay: 0.55 }} />
        </>)}
      </AnimatePresence>

      {/* Cat SVG */}
      <motion.div
        className="face-wrap"
        animate={{ scale, y: [0, -4, 0] }}
        transition={{
          scale: { type: "spring", stiffness: 180, damping: 18 },
          y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <svg viewBox="0 0 192 220" width="290" height="332" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="furMain" cx="50%" cy="45%" r="55%">
              <stop offset="0%"   stopColor="#c8c4be" />
              <stop offset="60%"  stopColor="#a8a49e" />
              <stop offset="100%" stopColor="#888480" />
            </radialGradient>
            <radialGradient id="furLight" cx="50%" cy="30%" r="60%">
              <stop offset="0%"   stopColor="#e8e4de" />
              <stop offset="100%" stopColor="#c8c4be" />
            </radialGradient>
            <radialGradient id="irisGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%"   stopColor="#f0b040" />
              <stop offset="50%"  stopColor={cfg.iris} />
              <stop offset="100%" stopColor="#7a4a08" />
            </radialGradient>
            <radialGradient id="noseGrad" cx="40%" cy="35%" r="60%">
              <stop offset="0%"   stopColor="#e8a0a0" />
              <stop offset="100%" stopColor="#c07070" />
            </radialGradient>
            <filter id="furShadow">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.45" />
            </filter>
            <filter id="eyeGlow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <clipPath id="eyeClipL">
              <ellipse cx="76" cy="88" rx="18" ry={blinking ? 1 : 17} />
            </clipPath>
            <clipPath id="eyeClipR">
              <ellipse cx="116" cy="88" rx="18" ry={blinking ? 1 : 17} />
            </clipPath>
          </defs>

          {/* ── Tail ── */}
          <motion.path
            stroke="#a8a49e" strokeWidth="14" fill="none" strokeLinecap="round"
            animate={{ d: tailSide > 0
              ? "M 96 195 Q 130 185 145 165 Q 158 148 148 135"
              : "M 96 195 Q 62 185 47 165 Q 34 148 44 135"
            }}
            transition={{ duration: isSpeaking ? 0.35 : 1.6, ease: "easeInOut" }}
          />
          <motion.path
            stroke="#c8c4be" strokeWidth="8" fill="none" strokeLinecap="round"
            animate={{ d: tailSide > 0
              ? "M 96 195 Q 130 185 145 165 Q 158 148 148 135"
              : "M 96 195 Q 62 185 47 165 Q 34 148 44 135"
            }}
            transition={{ duration: isSpeaking ? 0.35 : 1.6, ease: "easeInOut" }}
          />

          {/* ── Body ── */}
          <ellipse cx="96" cy="196" rx="44" ry="30" fill="url(#furMain)" />
          <ellipse cx="96" cy="192" rx="28" ry="22" fill="#e8e4de" opacity="0.7" />

          {/* ── Collar ── */}
          <path d="M 60 158 Q 96 168 132 158" stroke="#f59e0b" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M 60 158 Q 96 168 132 158" stroke="#ea580c" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
          <rect x="89" y="162" width="14" height="11" rx="3" fill="#ea580c" />
          <rect x="91" y="164" width="10" height="7"  rx="2" fill="#f97316" />

          {/* ── Head ── */}
          <ellipse cx="96" cy="96" rx="68" ry="66" fill="url(#furMain)" filter="url(#furShadow)" />

          {/* ── Tabby forehead stripes ── */}
          <path d="M 78 42 Q 82 36 86 42" stroke="#888480" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d="M 90 38 Q 96 32 102 38" stroke="#888480" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d="M 106 42 Q 110 36 114 42" stroke="#888480" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d="M 80 52 Q 88 46 96 50 Q 104 46 112 52" stroke="#888480" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />

          {/* ── Ears ── */}
          <polygon points="34,72 28,28 62,52" fill="url(#furMain)" />
          <polygon points="38,68 34,36 58,54" fill="#c8a0a0" opacity="0.6" />
          <polygon points="158,72 164,28 130,52" fill="url(#furMain)" />
          <polygon points="154,68 158,36 134,54" fill="#c8a0a0" opacity="0.6" />

          {/* ── Cheek fur ── */}
          <ellipse cx="38"  cy="108" rx="22" ry="18" fill="url(#furLight)" opacity="0.7" />
          <ellipse cx="154" cy="108" rx="22" ry="18" fill="url(#furLight)" opacity="0.7" />

          {/* ── Muzzle ── */}
          <ellipse cx="96" cy="118" rx="28" ry="22" fill="url(#furLight)" opacity="0.85" />

          {/* ── Eyes ── */}
          <ellipse cx="76"  cy="88" rx="18" ry={blinking ? 1.5 : 17} fill="white" style={{ transition: "ry 0.09s" }} />
          <g clipPath="url(#eyeClipL)">
            <circle cx="76" cy="88" r="14" fill="url(#irisGrad)" filter="url(#eyeGlow)" />
            <circle cx="76" cy="88" r="14" fill="none" stroke="#c47a1a" strokeWidth="1" opacity="0.4" />
            <circle cx="76" cy="88" r="10" fill="none" stroke="#a05a08" strokeWidth="0.5" opacity="0.3" />
            <circle ref={pupilLRef} cx="76" cy="88" r={blinking ? 0 : 7} fill={cfg.pupil} style={{ transition: "r 0.09s" }} />
            {!blinking && <circle cx="71" cy="83" r="3" fill="white" opacity="0.85" />}
            {!blinking && <circle cx="80" cy="91" r="1.5" fill="white" opacity="0.4" />}
          </g>
          <ellipse cx="76"  cy="88" rx="18" ry={blinking ? 1.5 : 17} fill="none" stroke="#888480" strokeWidth="1.5" style={{ transition: "ry 0.09s" }} />

          <ellipse cx="116" cy="88" rx="18" ry={blinking ? 1.5 : 17} fill="white" style={{ transition: "ry 0.09s" }} />
          <g clipPath="url(#eyeClipR)">
            <circle cx="116" cy="88" r="14" fill="url(#irisGrad)" filter="url(#eyeGlow)" />
            <circle cx="116" cy="88" r="14" fill="none" stroke="#c47a1a" strokeWidth="1" opacity="0.4" />
            <circle cx="116" cy="88" r="10" fill="none" stroke="#a05a08" strokeWidth="0.5" opacity="0.3" />
            <circle ref={pupilRRef} cx="116" cy="88" r={blinking ? 0 : 7} fill={cfg.pupil} style={{ transition: "r 0.09s" }} />
            {!blinking && <circle cx="111" cy="83" r="3" fill="white" opacity="0.85" />}
            {!blinking && <circle cx="120" cy="91" r="1.5" fill="white" opacity="0.4" />}
          </g>
          <ellipse cx="116" cy="88" rx="18" ry={blinking ? 1.5 : 17} fill="none" stroke="#888480" strokeWidth="1.5" style={{ transition: "ry 0.09s" }} />

          {/* ── Nose ── */}
          <path d="M 90 112 L 96 106 L 102 112 Q 96 116 90 112 Z" fill="url(#noseGrad)" />
          <path d="M 90 112 Q 96 116 102 112" stroke="#c07070" strokeWidth="0.5" fill="none" />

          {/* ── Philtrum ── */}
          <line x1="96" y1="112" x2="96" y2={mouthY} stroke="#b09080" strokeWidth="1" opacity="0.5" />

          {/* ── Mouth — animated open/close ── */}
          {/* Mouth cavity */}
          <motion.ellipse
            cx="96" cy={mouthY + openAmt * 0.5}
            rx={mouthW}
            ry={openAmt * 0.5 + 0.5}
            fill="#3a1010"
            animate={{ ry: openAmt * 0.5 + 0.5, cy: mouthY + openAmt * 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
          />
          {/* Upper lip */}
          <motion.path
            d={`M ${96 - mouthW} ${mouthY} Q 96 ${mouthY - 3} ${96 + mouthW} ${mouthY}`}
            stroke="#a07060" strokeWidth="2" fill="none" strokeLinecap="round"
          />
          {/* Lower lip — drops when speaking */}
          <motion.path
            d={`M ${96 - mouthW} ${mouthY} Q 96 ${mouthY + openAmt + 3} ${96 + mouthW} ${mouthY}`}
            stroke="#a07060" strokeWidth="2" fill="none" strokeLinecap="round"
            animate={{ d: `M ${96 - mouthW} ${mouthY} Q 96 ${mouthY + openAmt + 3} ${96 + mouthW} ${mouthY}` }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
          />

          {/* ── Whiskers ── */}
          <line x1="68" y1="112" x2="10" y2="104" stroke="#e8e4de" strokeWidth="1.2" opacity="0.85" strokeLinecap="round" />
          <line x1="68" y1="116" x2="8"  y2="116" stroke="#e8e4de" strokeWidth="1.2" opacity="0.85" strokeLinecap="round" />
          <line x1="68" y1="120" x2="12" y2="128" stroke="#e8e4de" strokeWidth="1.2" opacity="0.85" strokeLinecap="round" />
          <line x1="68" y1="112" x2="22" y2="100" stroke="#e8e4de" strokeWidth="0.8" opacity="0.5"  strokeLinecap="round" />
          <line x1="124" y1="112" x2="182" y2="104" stroke="#e8e4de" strokeWidth="1.2" opacity="0.85" strokeLinecap="round" />
          <line x1="124" y1="116" x2="184" y2="116" stroke="#e8e4de" strokeWidth="1.2" opacity="0.85" strokeLinecap="round" />
          <line x1="124" y1="120" x2="180" y2="128" stroke="#e8e4de" strokeWidth="1.2" opacity="0.85" strokeLinecap="round" />
          <line x1="124" y1="112" x2="170" y2="100" stroke="#e8e4de" strokeWidth="0.8" opacity="0.5"  strokeLinecap="round" />

          {/* ── Tabby cheek marks ── */}
          <path d="M 42 96 Q 50 92 56 98" stroke="#888480" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M 40 104 Q 50 100 58 106" stroke="#888480" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M 136 98 Q 142 92 150 96" stroke="#888480" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M 134 106 Q 142 100 152 104" stroke="#888480" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* Status */}
      <div className="avatar-status-bar">
        <motion.div
          className={`status-dot ${isSpeaking ? "speaking" : isListening ? "listening" : "idle"}`}
          animate={isSpeaking || isListening ? { scale: [1, 1.5, 1] } : { scale: 1 }}
          transition={{ duration: 0.7, repeat: Infinity }}
        />
        <span className="status-label">{label}</span>
      </div>
    </div>
  );
}
