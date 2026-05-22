'use client';

import { useEffect, useState } from 'react';
import { LucaSession } from '@/types';
import { formatTimeAgo, formatMoney, getLatestSession } from '@/lib/luca';

interface LucaStatusDotProps {
  userId: string;
  activeSession: LucaSession | null;
  onClick?: () => void;
}

/**
 * Always-visible indicator. Pulses purple while running; static grey when idle.
 */
export default function LucaStatusDot({ userId, activeSession, onClick }: LucaStatusDotProps) {
  const [latest, setLatest] = useState<LucaSession | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setLatest(getLatestSession(userId) ?? null);
  }, [userId, activeSession?.status, activeSession?.steps.length]);

  // tick "Last ran" label every minute
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const running = activeSession?.status === 'running';
  const ref = running ? activeSession : latest;

  const label = running
    ? 'Running'
    : ref?.completedAt
    ? `Last ran ${formatTimeAgo(ref.completedAt)}`
    : 'Idle';

  const sub = running
    ? `${activeSession!.steps.length} step${activeSession!.steps.length === 1 ? '' : 's'}`
    : ref && ref.totalValue > 0
    ? `${formatMoney(ref.totalValue)} found`
    : '';

  // suppress the "now" var lint by referencing it
  void now;

  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: 14,
        right: 16,
        zIndex: 60,
        background: 'rgba(20,20,28,0.85)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        borderRadius: 999,
        padding: '7px 13px 7px 11px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
      }}
      title="Open Luca log"
    >
      <span
        className={running ? 'luca-pulse' : ''}
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: running ? '#9D8FFF' : '#5A5A66',
          flexShrink: 0,
        }}
      />
      <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#F2F1EE', letterSpacing: '0.04em' }}>
          Luca · {label}
        </p>
        {sub && (
          <p style={{ fontSize: 9.5, color: '#8B8B96', marginTop: 2, letterSpacing: '0.02em' }}>
            {sub}
          </p>
        )}
      </div>
    </button>
  );
}
