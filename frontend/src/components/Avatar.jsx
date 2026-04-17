import React, { useEffect, useRef } from "react";

const MOUTH_SHAPES = {
  idle:     "M 35 62 Q 50 66 65 62",
  talking1: "M 35 62 Q 50 72 65 62",
  talking2: "M 35 64 Q 50 58 65 64",
  talking3: "M 35 60 Q 50 75 65 60",
  happy:    "M 35 60 Q 50 74 65 60",
  sad:      "M 35 66 Q 50 58 65 66",
  surprised:"M 44 60 Q 50 72 56 60",
};

// Eyebrow positions per emotion
const EYEBROWS = {
  neutral:   { left: "M 65 76 Q 75 72 85 76",  right: "M 115 76 Q 125 72 135 76" },
  happy:     { left: "M 65 74 Q 75 70 85 74",  right: "M 115 74 Q 125 70 135 74" },
  sad:       { left: "M 65 74 Q 75 78 85 74",  right: "M 115 74 Q 125 78 135 74" },
  surprised: { left: "M 65 72 Q 75 67 85 72",  right: "M 115 72 Q 125 67 135 72" },
  thinking:  { left: "M 65 76 Q 75 72 85 74",  right: "M 115 74 Q 125 72 135 76" },
};

const EMOTION_COLORS = {
  neutral:   "#6366f1",
  happy:     "#f59e0b",
  sad:       "#60a5fa",
  surprised: "#a78bfa",
  thinking:  "#34d399",
};

export default function Avatar({ isSpeaking, isListening, emotion = "neutral", audioLevel = 0 }) {
  const mouthRef    = useRef(null);
  const leftBrowRef = useRef(null);
  const rightBrowRef= useRef(null);
  const blinkLRef   = useRef(null);
  const blinkRRef   = useRef(null);
  const frameRef    = useRef(null);
  const svgRef      = useRef(null);

  // Blinking
  useEffect(() => {
    let t;
    const blink = () => {
      [blinkLRef, blinkRRef].forEach(r => {
        if (r.current) {
          r.current.setAttribute("ry", "1");
          setTimeout(() => r.current?.setAttribute("ry", "8"), 120);
        }
      });
      t = setTimeout(blink, 2500 + Math.random() * 2000);
    };
    t = setTimeout(blink, 1500);
    return () => clearTimeout(t);
  }, []);

  // Lip-sync
  useEffect(() => {
    if (!isSpeaking) {
      if (mouthRef.current) {
        const shape = emotion === "happy" ? MOUTH_SHAPES.happy
          : emotion === "sad" ? MOUTH_SHAPES.sad
          : MOUTH_SHAPES.idle;
        mouthRef.current.setAttribute("d", shape);
      }
      clearTimeout(frameRef.current);
      return;
    }
    const shapes = [MOUTH_SHAPES.talking1, MOUTH_SHAPES.talking2, MOUTH_SHAPES.talking3, MOUTH_SHAPES.talking2];
    let f = 0;
    const animate = () => {
      mouthRef.current?.setAttribute("d", shapes[f++ % shapes.length]);
      frameRef.current = setTimeout(() => requestAnimationFrame(animate), 110);
    };
    requestAnimationFrame(animate);
    return () => clearTimeout(frameRef.current);
  }, [isSpeaking, emotion]);

  // Emotion → eyebrows + mouth
  useEffect(() => {
    const brows = EYEBROWS[emotion] || EYEBROWS.neutral;
    leftBrowRef.current?.setAttribute("d", brows.left);
    rightBrowRef.current?.setAttribute("d", brows.right);
    if (!isSpeaking && mouthRef.current) {
      mouthRef.current.setAttribute("d", MOUTH_SHAPES[emotion] || MOUTH_SHAPES.idle);
    }
  }, [emotion, isSpeaking]);

  const accentColor = EMOTION_COLORS[emotion] || "#6366f1";
  const ringColor   = isSpeaking ? accentColor : isListening ? "#34d399" : "#374151";
  const ringOpacity = isSpeaking || isListening ? 1 : 0.3;

  // Audio visualizer: scale outer ring based on audioLevel (0–1)
  const visualizerR = 95 + audioLevel * 18;

  const statusText = isSpeaking ? "🔊 Speaking..."
    : isListening ? "🎙️ Listening..."
    : emotion === "thinking" ? "🤔 Thinking..."
    : "💤 Idle";

  return (
    <div className="avatar-wrapper">
      <svg
        ref={svgRef}
        className={`avatar-ring ${isSpeaking ? "ring-speaking" : isListening ? "ring-listening" : ""}`}
        viewBox="0 0 200 200"
        width="240"
        height="240"
      >
        {/* Audio visualizer ring */}
        {(isListening || isSpeaking) && (
          <circle
            cx="100" cy="100" r={visualizerR}
            fill="none"
            stroke={ringColor}
            strokeWidth="2"
            opacity="0.25"
            style={{ transition: "r 0.08s ease-out" }}
          />
        )}

        <circle cx="100" cy="100" r="95" fill="none" stroke={ringColor} strokeWidth="3" opacity={ringOpacity} />
        <circle cx="100" cy="100" r="85" fill="#1f2937" />
        <circle cx="100" cy="100" r="70" fill="#374151" />

        {/* Eyes */}
        <ellipse cx="75" cy="88" rx="8" ry="8" fill="#e5e7eb" />
        <ellipse cx="77" cy="88" rx="5" ry="5" fill={accentColor} />
        <ellipse cx="78" cy="87" rx="2" ry="2" fill="#1e1b4b" />
        <ellipse ref={blinkLRef} cx="75" cy="88" rx="8" ry="8" fill="#374151" />

        <ellipse cx="125" cy="88" rx="8" ry="8" fill="#e5e7eb" />
        <ellipse cx="127" cy="88" rx="5" ry="5" fill={accentColor} />
        <ellipse cx="128" cy="87" rx="2" ry="2" fill="#1e1b4b" />
        <ellipse ref={blinkRRef} cx="125" cy="88" rx="8" ry="8" fill="#374151" />

        {/* Eyebrows */}
        <path ref={leftBrowRef}  d={EYEBROWS.neutral.left}  stroke="#9ca3af" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path ref={rightBrowRef} d={EYEBROWS.neutral.right} stroke="#9ca3af" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Nose */}
        <path d="M 100 95 Q 96 105 100 108 Q 104 105 100 95" stroke="#9ca3af" strokeWidth="1.5" fill="none" />

        {/* Mouth */}
        <path ref={mouthRef} d={MOUTH_SHAPES.idle} stroke="#e5e7eb" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Emotion sparkle for happy */}
        {emotion === "happy" && (
          <>
            <text x="148" y="72" fontSize="10" className="sparkle">✨</text>
            <text x="42"  y="72" fontSize="10" className="sparkle">✨</text>
          </>
        )}
      </svg>

      <div className="avatar-status">{statusText}</div>
    </div>
  );
}
