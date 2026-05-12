import { Router } from "express";

const router = Router();

const FALLBACKS = [
  "Markets are shifting ahead of this week. Worth a conversation.",
  "Your money does not sleep. Neither does Kleo.",
  "Small moves compound. The best time to review is now.",
  "Rates are telling a story. Want to know what it means for you?",
  "One conversation can change your financial trajectory.",
  "The wealthiest people have advisors. Now so do you.",
];

router.get("/insight", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
    return res.json({ insight: fallback });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a single compelling, short financial insight or thought (1-2 sentences max) for a personal finance AI app. Make it feel timely, smart, and motivating. Do not mention specific stock prices or numbers. Do not use quotation marks. Do not start with "I". Output only the insight text, nothing else.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 80,
          },
        }),
      }
    );

    if (!response.ok) throw new Error("Gemini API error");

    const data = await response.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const insight = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    res.json({ insight: insight || FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)] });
  } catch (err) {
    console.error("Insight error:", err);
    res.json({ insight: FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)] });
  }
});

export default router;
