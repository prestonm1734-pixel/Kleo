'use client';

import { useEffect, useRef, useState } from 'react';
import { Plug, Search, Sparkles, Check, AlertTriangle, Cpu, Zap } from 'lucide-react';
import { LucaSession, LucaStep, LucaStepType } from '@/types';
import { stepColor } from '@/lib/luca';

interface LucaTerminalProps {
  session: LucaSession | null;
  /** When true and the session is complete, render the collapse animation. */
  collapseOnComplete?: boolean;
}

const TYPING_MS_PER_CHAR = 18;

/**
 * Terminal-style live feed. Each step types out character-by-character.
 * When the session completes and collapseOnComplete is true, the terminal
 * slides up and fades after a beat, letting the finding cards take over.
 */
export default function LucaTerminal({
  session,
  collapseOnComplete = true,
}: LucaTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [typedUpTo, setTypedUpTo] = useState(0); // chars typed in the current (last) step

  // Track which step we're currently typing
  const stepsRef = useRef<LucaStep[]>([]);
  stepsRef.current = session?.steps ?? [];

  // Auto-scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [session?.steps.length, typedUpTo]);

  // Type out the latest step
  useEffect(() => {
    if (!session) return;
    const steps = session.steps;
    if (steps.length === 0) return;
    const last = steps[steps.length - 1];
    const full = last.message.length;
    setTypedUpTo(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypedUpTo(i);
      if (i >= full) clearInterval(id);
    }, TYPING_MS_PER_CHAR);
    return () => clearInterval(id);
  }, [session?.steps.length]);

  if (!session) return null;

  const isDone = session.status === 'complete';
  const collapseClass = isDone && collapseOnComplete ? 'luca-collapse' : '';

  return (
    <div
      className={`luca-terminal ${collapseClass}`}
      style={{
        padding: '14px 16px',
        margin: '0 auto 14px',
        maxWidth: 720,
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingBottom: 10,
          marginBottom: 10,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: isDone ? '#6FCF97' : '#9D8FFF',
          }}
          className={!isDone ? 'luca-pulse' : ''}
        />
        <span style={{ color: '#F2F1EE', fontWeight: 600, fontSize: 11.5, letterSpacing: '0.08em' }}>
          LUCA AGENT
        </span>
        <span style={{ color: '#5A5A66', fontSize: 11 }}>
          {isDone ? '— complete' : '— running now'}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ color: '#5A5A66', fontSize: 11 }}>
          {session.steps.length} step{session.steps.length === 1 ? '' : 's'}
          {session.findings.length > 0 && ` · ${session.findings.length} found`}
        </span>
      </div>

      {/* Lines */}
      <div
        ref={containerRef}
        style={{
          maxHeight: 240,
          overflowY: 'auto',
        }}
      >
        {session.steps.map((step, i) => {
          const isLast = i === session.steps.length - 1;
          const text = isLast ? step.message.slice(0, typedUpTo) : step.message;
          return (
            <Line
              key={step.id}
              type={step.type}
              text={text}
              showCaret={isLast && !isDone}
            />
          );
        })}
      </div>
    </div>
  );
}

function Line({
  type,
  text,
  showCaret,
}: {
  type: LucaStepType;
  text: string;
  showCaret: boolean;
}) {
  const color = stepColor(type);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '2px 0',
      }}
    >
      <span style={{ width: 14, paddingTop: 2, color, opacity: 0.85, flexShrink: 0 }}>
        <StepIcon type={type} />
      </span>
      <span style={{ color: '#5A5A66', flexShrink: 0 }}>▸</span>
      <span style={{ color, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {text}
        {showCaret && <span className="luca-caret" />}
      </span>
    </div>
  );
}

function StepIcon({ type }: { type: LucaStepType }) {
  switch (type) {
    case 'connecting': return <Plug size={12} />;
    case 'reading':    return <Cpu size={12} />;
    case 'analyzing':  return <Search size={12} />;
    case 'found':      return <Sparkles size={12} />;
    case 'complete':   return <Check size={12} />;
    case 'error':      return <AlertTriangle size={12} />;
    default:           return <Zap size={12} />;
  }
}
