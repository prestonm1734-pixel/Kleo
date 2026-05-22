import { NextRequest } from 'next/server';
import { LUCA_SCRIPT, newSessionId } from '@/lib/luca';

export const runtime = 'edge';

/**
 * Streams Luca's autonomous agent run as SSE events.
 * Each line of the scripted timeline is emitted with a realistic delay
 * so the client can render the terminal-style "agent thinking" feed.
 *
 * Event payloads:
 *   { sessionId, step: { id, type, message, timestamp, finding? } }
 *   { sessionId, done: true }
 *
 * Architecture is real (true server-streamed SSE); the script is mocked
 * until live integration data is wired in (see lib/luca.ts TODO).
 */
export async function POST(_req: NextRequest) {
  const sessionId = newSessionId();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        for (let i = 0; i < LUCA_SCRIPT.length; i++) {
          const s = LUCA_SCRIPT[i];
          const step = {
            id: `${sessionId}_${i}`,
            type: s.type,
            message: s.message,
            timestamp: Date.now(),
            ...(s.finding
              ? {
                  finding: {
                    id: `${sessionId}_f_${i}`,
                    ...s.finding,
                  },
                }
              : {}),
          };
          send({ sessionId, step });
          if (s.delayMs > 0) {
            await new Promise((r) => setTimeout(r, s.delayMs));
          }
        }
        send({ sessionId, done: true });
      } catch (err) {
        send({ sessionId, error: err instanceof Error ? err.message : 'unknown' });
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
