'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LucaFinding, LucaSession, LucaStep } from '@/types';
import {
  getLatestSession,
  getSessions,
  newSessionId,
  saveSession,
} from '@/lib/luca';

interface UseLucaSessionOptions {
  userId: string;
  onComplete?: (session: LucaSession) => void;
  onFinding?: (finding: LucaFinding) => void;
}

interface UseLucaSessionResult {
  session: LucaSession | null;
  pastSessions: LucaSession[];
  isRunning: boolean;
  run: () => Promise<void>;
  cancel: () => void;
  refresh: () => void;
}

/**
 * Drives a Luca agent session: opens the SSE stream, accumulates steps,
 * persists the final session to localStorage, exposes pastSessions for the
 * mission log. Reading the stream is the user-visible "agent thinking" effect.
 */
export function useLucaSession({
  userId,
  onComplete,
  onFinding,
}: UseLucaSessionOptions): UseLucaSessionResult {
  const [session, setSession] = useState<LucaSession | null>(null);
  const [pastSessions, setPastSessions] = useState<LucaSession[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(() => {
    if (!userId) return;
    setPastSessions(getSessions(userId));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isRunning = session?.status === 'running';

  const run = useCallback(async () => {
    if (!userId || isRunning) return;

    const sid = newSessionId();
    const fresh: LucaSession = {
      id: sid,
      userId,
      startedAt: Date.now(),
      steps: [],
      findings: [],
      status: 'running',
      totalValue: 0,
    };
    setSession(fresh);

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/luca/run', {
        method: 'POST',
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error('Luca stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let working: LucaSession = fresh;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === '[DONE]') continue;
          let parsed: {
            sessionId?: string;
            step?: LucaStep & { finding?: LucaFinding };
            done?: boolean;
            error?: string;
          };
          try {
            parsed = JSON.parse(raw);
          } catch {
            continue;
          }

          if (parsed.step) {
            const { finding, ...step } = parsed.step;
            working = {
              ...working,
              steps: [...working.steps, step],
              findings: finding
                ? [...working.findings, finding]
                : working.findings,
              totalValue: finding
                ? working.totalValue + finding.amount
                : working.totalValue,
            };
            setSession(working);
            if (finding) onFinding?.(finding);
          }

          if (parsed.done) {
            working = {
              ...working,
              status: 'complete',
              completedAt: Date.now(),
            };
            setSession(working);
            saveSession(userId, working);
            refresh();
            onComplete?.(working);
          }

          if (parsed.error) {
            working = { ...working, status: 'error', completedAt: Date.now() };
            setSession(working);
            saveSession(userId, working);
            refresh();
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setSession((prev) =>
        prev ? { ...prev, status: 'error', completedAt: Date.now() } : prev,
      );
    }
  }, [userId, isRunning, onComplete, onFinding, refresh]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setSession((prev) =>
      prev ? { ...prev, status: 'error', completedAt: Date.now() } : prev,
    );
  }, []);

  // On mount, also surface the most recent past session (for "Last ran" UI).
  useEffect(() => {
    if (!userId || session) return;
    const latest = getLatestSession(userId);
    if (latest && latest.status !== 'running') {
      // not the "running" session — just for the dot label
    }
  }, [userId, session]);

  return { session, pastSessions, isRunning, run, cancel, refresh };
}
