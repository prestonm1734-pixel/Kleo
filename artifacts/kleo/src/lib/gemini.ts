import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are Kleo, a personal AI CFO. You know everything about personal finance, tax strategy, investing, debt, real estate, retirement, credit, and business finances. You speak like the smartest most trusted financial friend alive. Direct, warm, specific, never generic. Lead with the answer always. Never say Great question or Certainly or As an AI.`;

export async function streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (!apiKey) {
    const demo = "To get real answers from Kleo, add your VITE_GEMINI_API_KEY environment variable. I'm a personal AI CFO ready to help with taxes, investing, debt, real estate, and everything money.";
    for (const char of demo) {
      if (signal?.aborted) return;
      onChunk(char);
      await new Promise((r) => setTimeout(r, 18));
    }
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1].content;

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage);

  for await (const chunk of result.stream) {
    if (signal?.aborted) return;
    onChunk(chunk.text());
  }
}
