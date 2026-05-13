import { NextResponse } from 'next/server';

export const runtime = 'edge';

const FALLBACK_INSIGHTS = [
  'Markets are shifting ahead of this week. Worth a conversation.',
  'Your money does not sleep. Neither does Kleo.',
  'Something moved overnight. Ask me about it.',
  'Small moves compound. The best time to review is now.',
  'Rates are telling a story. Want to know what it means for you?',
  'One conversation can change your financial trajectory.',
  'The wealthiest people have advisors. Now so do you.',
  'Your net worth is a number you can change. Ask me how.',
];

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const fallback = FALLBACK_INSIGHTS[Math.floor(Math.random() * FALLBACK_INSIGHTS.length)];
    return NextResponse.json({ insight: fallback });
  }

  try {
    const prompt = 'Generate exactly one short conversational sentence about current financial markets or a compelling financial observation. Maximum 12 words. Casual and intelligent tone. Never corporate. Examples: "Markets are shifting ahead of this week. Worth a conversation." "Your money does not sleep. Neither does Kleo." "Something moved overnight. Ask me about it." Return ONLY the sentence, nothing else.';

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 1.0, maxOutputTokens: 60 },
        }),
      }
    );

    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!text) throw new Error('Empty response');
    return NextResponse.json({ insight: text });
  } catch {
    const fallback = FALLBACK_INSIGHTS[Math.floor(Math.random() * FALLBACK_INSIGHTS.length)];
    return NextResponse.json({ insight: fallback });
  }
}
