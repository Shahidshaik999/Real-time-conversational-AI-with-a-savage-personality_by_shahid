# Nova AI Voice Avatar

A real-time AI voice companion with an animated avatar, powered by Groq (LLaMA 3), browser Web Speech APIs, and a full suite of personality modes — from friendly assistant to savage roast machine.

---

## Demo Features

- Animated cat avatar with lip-sync, blinking, tail wag, and eye tracking
- Real-time voice conversation (speak → AI responds → speaks back)
- 8 personality modes including Savage, Indian Mom, Toxic Friend, Robot, Girlfriend
- Streaming AI responses via SSE
- Persistent chat memory across sessions
- Wake word detection ("Hey Nova")
- Continuous listening mode — auto-listens after every response
- Image analysis via drag-and-drop (Groq Vision)
- Live audio waveform visualizer
- Conversation export as .txt
- Fullscreen immersive mode
- Onboarding flow on first visit
- Dark mode UI with Inter font

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite                     |
| Styling   | CSS (custom dark theme)             |
| Animation | Framer Motion + SVG                 |
| Backend   | Node.js + Express                   |
| AI Model  | Groq API — llama-3.1-8b-instant     |
| Vision    | Groq — llama-3.2-11b-vision-preview |
| Speech In | Web Speech API (browser)            |
| Speech Out| SpeechSynthesis API (browser)       |

---

## Project Structure

```
ai-voice-avatar/
├── backend/
│   ├── server.js          # Express API — chat, vision, summarize endpoints
│   ├── package.json
│   └── .env               # Your Groq API key goes here
│
├── frontend/
│   ├── public/
│   │   └── avatar.png     # Optional custom avatar image
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar3D.jsx     # Animated SVG cat avatar
│   │   │   ├── ChatLog.jsx      # Conversation panel
│   │   │   ├── Controls.jsx     # Mic, personality, voice, settings
│   │   │   ├── ImageDrop.jsx    # Drag-and-drop image input
│   │   │   ├── Onboarding.jsx   # First-visit intro flow
│   │   │   └── Waveform.jsx     # Live audio visualizer
│   │   ├── hooks/
│   │   │   ├── useAudioLevel.js       # Mic audio level + analyser node
│   │   │   ├── useSpeechRecognition.js # Browser speech-to-text
│   │   │   ├── useSpeechSynthesis.js  # Browser text-to-speech
│   │   │   └── useWakeWord.js         # "Hey Nova" wake word detection
│   │   ├── App.jsx          # Main app — state, layout, logic
│   │   ├── App.css          # Full dark theme styles
│   │   └── main.jsx         # React entry point
│   ├── index.html
│   ├── vite.config.js       # Vite + proxy to backend
│   └── package.json
│
└── README.md
```

---
<img width="1881" height="907" alt="image" src="https://github.com/user-attachments/assets/7bbfcebd-af9d-4938-96fb-ce50e7b780d3" />


## Setup

### 1. Get a Groq API Key

Sign up free at [https://console.groq.com](https://console.groq.com) and create an API key.

### 2. Configure the backend

```bash
cd ai-voice-avatar/backend
cp .env.example .env
```

Edit `.env` and add your key:

```
GROQ_API_KEY=gsk_your_key_here
PORT=3001
```

### 3. Install dependencies

```bash
# Backend
cd ai-voice-avatar/backend
npm install

# Frontend
cd ai-voice-avatar/frontend
npm install
```

### 4. Run the project

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd ai-voice-avatar/backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd ai-voice-avatar/frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in **Chrome or Edge**.

> Firefox is not supported — Web Speech API requires Chrome/Edge.

---

## Usage

### Speaking
Click the **Speak** button and talk. Nova listens, thinks, and responds with voice.

### Continuous Mode
Toggle **Always Ready to Listen** — Nova automatically starts listening again after every response. No clicking needed.

### Wake Word
Toggle **Hey Nova** — say "Hey Nova" at any time to activate listening without touching the screen.

### Personality Modes

| Mode         | Description                                              |
|--------------|----------------------------------------------------------|
| Friendly     | Warm, encouraging, conversational                        |
| Serious      | Professional, precise, factual                           |
| Witty        | Clever humor, wordplay                                   |
| Savage 💀    | Viral roast energy — max 15 words, punchline every time  |
| Toxic Friend | Close friend roasting you, Gen Z slang                   |
| Indian Mom   | Hinglish guilt trips, taunts, emotional blackmail        |
| Robot        | Cold logical roasts, system error style                  |
| Girlfriend   | Sassy, judging, slightly unimpressed energy              |

### Image Analysis
Drag any image onto the drop zone in the left panel. Nova will describe and discuss it using Groq's vision model.

### Typing Fallback
Use the text input field if your mic isn't available.

### Export
Click **Export** to download the full conversation as a `.txt` file.

### Fullscreen
Click **Fullscreen** for an immersive dark room experience — just the glowing avatar.

---

## API Endpoints

| Method | Endpoint            | Description                          |
|--------|---------------------|--------------------------------------|
| POST   | `/api/chat/stream`  | Streaming chat via SSE               |
| POST   | `/api/vision`       | Image analysis (base64 image input)  |
| POST   | `/api/summarize`    | Summarize conversation history       |

### Chat Stream Request
```json
{
  "messages": [{ "role": "user", "content": "Hello" }],
  "personality": "savage"
}
```

### Vision Request
```json
{
  "text": "What's in this image?",
  "image": "data:image/jpeg;base64,...",
  "personality": "friendly"
}
```

---

## Avatar

The avatar is a fully hand-drawn SVG British Shorthair cat with:

- Amber eyes with iris detail and pupil tracking (follows mouse cursor)
- Animated blinking every 2–4 seconds
- Tail that wags — faster when speaking
- Mouth that opens and closes with lip-sync during speech
- Tabby stripe markings, whiskers, orange collar with tag
- Emotion-based iris color changes (amber → green for happy, blue for sad, etc.)
- Pulse rings that radiate outward when speaking or listening
- Gentle floating idle animation

---

## Memory & Summarization

Chat history is saved to `localStorage` and persists across browser sessions. After 10 messages, the conversation is automatically summarized to keep token usage low while maintaining context.

---

## Environment Variables

| Variable      | Required | Description          |
|---------------|----------|----------------------|
| GROQ_API_KEY  | Yes      | Your Groq API key    |
| PORT          | No       | Backend port (3001)  |

---

## Browser Requirements

| Feature           | Chrome | Edge | Firefox |
|-------------------|--------|------|---------|
| Speech Recognition| ✅     | ✅   | ❌      |
| Speech Synthesis  | ✅     | ✅   | ✅      |
| Web Audio API     | ✅     | ✅   | ✅      |

---

## License

MIT — free to use, modify, and build on.
