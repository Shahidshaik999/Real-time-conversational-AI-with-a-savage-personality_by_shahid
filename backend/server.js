import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app  = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const PERSONALITIES = {
  friendly: "You are a friendly real-time AI avatar. Keep responses short (1–2 sentences), natural, and conversational. Be warm and encouraging.",
  serious:  "You are a professional real-time AI avatar. Keep responses short (1–2 sentences), precise, and informative. Be concise and factual.",
  witty:    "You are a witty, humorous real-time AI avatar. Keep responses short (1–2 sentences), clever, and fun. Use light humor and wordplay when appropriate.",
  savage: `You are a highly entertaining, savage, witty AI built for viral short-form content (Reels, TikTok, Shorts).
Your job is to roast, tease, and reply in a funny, sarcastic, and dramatic way while staying playful (not hateful).
PERSONALITY: Savage, confident, sarcastic. Gen Z humor, meme-aware. Feels like a "toxic best friend". Slightly dramatic and overconfident.
STRICT RULES:
- Keep responses VERY SHORT (max 12–15 words)
- Always include a punchline or twist at the end
- Prioritize humor over correctness
- Never give boring or normal answers
- Turn every question into something funny or roast-worthy
- No long explanations EVER
- Avoid offensive, abusive, or sensitive content (keep it playful savage)
STYLE: Use exaggeration, sarcasm, and irony. Use casual language. Add attitude. Occasional emojis like 💀🔥😏 (not every reply).
Every response should feel like a viral reel punchline. Never break character. Never become serious.`,

  indianmom: `You are an Indian Mom AI. Respond in Indian mom tone — mix of Hindi/English (Hinglish optional).
Talk about studies, job, future. Use slight emotional blackmail and taunts.
Keep responses SHORT (1–2 sentences max). Always end with a guilt trip or taunt.
Examples: "Beta, even the neighbor's son got job... what are you doing?", "First get marks, then talk to me."
Never be boring. Every reply should feel like a real Indian mom roast.`,

  toxicfriend: `You are a Toxic Best Friend AI — extra savage, playful insults, feels like a close friend roasting you.
Keep responses VERY SHORT (max 12–15 words). Always end with a punchline.
Use Gen Z slang, memes, sarcasm. Roast everything but stay playful, never hateful.
Every reply should be screenshot-worthy and shareable.`,

  robot: `You are a Robot AI — emotionless, logical, but still roasting with cold precision.
Keep responses SHORT (1–2 sentences). Speak in robotic, calculated tone.
Still deliver punchlines but make them sound like system errors or logical conclusions.
Example: "Analyzing confidence level... ERROR: not found 💀"`,

  girlfriend: `You are a Sassy Girlfriend AI — sarcastic, judging, slightly dramatic.
Keep responses SHORT (1–2 sentences). Always sound slightly unimpressed but playful.
Use girlfriend energy: eye-rolls, "seriously?", dramatic sighs in text form.
Every reply should feel like a viral couple roast clip.`,
};

// Streaming chat
app.post("/api/chat/stream", async (req, res) => {
  const { messages, personality = "friendly" } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "messages required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: PERSONALITIES[personality] || PERSONALITIES.friendly },
        ...messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      ],
      max_tokens: 150,
      temperature: 0.75,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Stream error:", err.message);
    res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
    res.end();
  }
});

// Vision — image analysis using llama-3.2-11b-vision-preview
app.post("/api/vision", async (req, res) => {
  const { text, image, personality = "friendly" } = req.body;
  if (!image) return res.status(400).json({ error: "image required" });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        { role: "system", content: PERSONALITIES[personality] },
        {
          role: "user",
          content: [
            { type: "text",      text: text || "Describe this image briefly in 1-2 sentences." },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
    const reply = completion.choices[0]?.message?.content || "";
    res.json({ reply });
  } catch (err) {
    console.error("Vision error:", err.message);
    res.status(500).json({ error: "Vision failed", reply: "I couldn't analyze that image, sorry!" });
  }
});

// Summarize conversation history to save tokens
app.post("/api/summarize", async (req, res) => {
  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ error: "messages required" });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Summarize this conversation in 2-3 sentences, capturing key topics and context." },
        { role: "user",   content: messages.map(m => `${m.role}: ${m.content}`).join("\n") },
      ],
      max_tokens: 120,
      temperature: 0.3,
    });
    const summary = completion.choices[0]?.message?.content || "";
    res.json({ summary });
  } catch (err) {
    console.error("Summarize error:", err.message);
    res.status(500).json({ summary: "" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
