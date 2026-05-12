import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, agentId, systemPrompt, fileContent } = await req.json();

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return new Response(
        createSSEStream('I need a Gemini API key to respond. Please add your NEXT_PUBLIC_GEMINI_API_KEY to the .env.local file. Get a free key at aistudio.google.com'),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    // Build Gemini request
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Add file content to last user message if present
    if (fileContent && contents.length > 0) {
      const lastUser = [...contents].reverse().find((c: { role: string }) => c.role === 'user');
      if (lastUser) {
        lastUser.parts[0].text += fileContent;
      }
    }

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    };

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!geminiRes.ok || !geminiRes.body) {
      const errText = await geminiRes.text();
      return new Response(
        createSSEStream(`API error: ${geminiRes.status}. ${errText.slice(0, 200)}`),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        }
      );
    }

    // Proxy the SSE stream
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();

    (async () => {
      try {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (!data || data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (text) {
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {}
            }
          }
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch {}
      finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function createSSEStream(message: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: message })}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}
