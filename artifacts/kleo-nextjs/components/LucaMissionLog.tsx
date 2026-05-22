'use client';

import { useMemo } from 'react';
import { Play, Sparkles, Flame } from 'lucide-react';
import { LucaSession } from '@/types';
import { formatMoney, formatTimeAgo, lifetimeSavings } from '@/lib/luca';

interface LucaMissionLogProps {
  userId: string;
  pastSessions: LucaSession[];
  isRunning: boolean;
  onRun: () => void;
  onOpenSession?: (id: string) => void;
}

/**
 * Sidebar "Luca's missions" panel: streak counter + run-now CTA + mission list.
 */
export default function LucaMissionLog({
  userId,
  pastSessions,
  isRunning,
  onRun,
  onOpenSession,
}: LucaMissionLogProps) {
  const total = useMemo(() => lifetimeSavings(userId), [userId, pastSessions.length]);
  const streak = computeStreak(pastSessions);

  return (
    <div style={{ padding: '8px 8px 4px' }}>
      <p
        style={{
          fontSize: 10,
          color: '#5A5A66',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          padding: '4px 8px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Sparkles size={11} style={{ color: '#9D8FFF' }} /> Luca · Missions
      </p>

      {/* Run now CTA */}
      <button
        onClick={onRun}
        disabled={isRunning}
        className="w-full"
        style={{
          padding: '10px 12px',
          borderRadius: 12,
          background: isRunning
            ? 'rgba(123,111,232,0.18)'
            : 'linear-gradient(135deg, #7B6FE8 0%, #5C4FD8 100%)',
          color: 'white',
          fontSize: 12.5,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          opacity: isRunning ? 0.85 : 1,
          cursor: isRunning ? 'default' : 'pointer',
        }}
      >
        <span className="flex items-center gap-2">
          <Play size={12} />
          {isRunning ? 'Luca running...' : 'Run Luca now'}
        </span>
        {!isRunning && total > 0 && (
          <span
            style={{
              fontSize: 10.5,
              background: 'rgba(255,255,255,0.18)',
              padding: '2px 7px',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            {formatMoney(total)} found
          </span>
        )}
      </button>

      {/* Streak strip */}
      {(streak.days > 0 || total > 0) && (
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10,
          }}
        >
          <Flame size={13} style={{ color: '#F2C94C', flexShrink: 0 }} />
          <p style={{ fontSize: 11, color: '#8B8B96', lineHeight: 1.4 }}>
            {streak.days > 0 ? (
              <>
                <span style={{ color: '#F2F1EE', fontWeight: 600 }}>
                  {streak.days} day{streak.days === 1 ? '' : 's'}
                </span>{' '}
                in a row
                {total > 0 && (
                  <>
                    {' · '}saved you{' '}
                    <span style={{ color: '#F2F1EE', fontWeight: 600 }}>{formatMoney(total)}</span>
                  </>
                )}
              </>
            ) : (
              <>
                Lifetime found:{' '}
                <span style={{ color: '#F2F1EE', fontWeight: 600 }}>{formatMoney(total)}</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Mission list */}
      {pastSessions.length > 0 && (
        <div style={{ marginTop: 10, maxHeight: 180, overflowY: 'auto' }}>
          {pastSessions.slice(0, 6).map((s) => (
            <button
              key={s.id}
              onClick={() => onOpenSession?.(s.id)}
              className="w-full"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 8px',
                borderRadius: 8,
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: s.status === 'complete' ? '#9D8FFF' : '#5A5A66',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11.5, color: '#8B8B96', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatTimeAgo(s.completedAt ?? s.startedAt)}
                {' · '}
                {s.findings.length} finding{s.findings.length === 1 ? '' : 's'}
              </span>
              <span style={{ fontSize: 11, color: '#F2F1EE', fontWeight: 600, flexShrink: 0 }}>
                {formatMoney(s.totalValue)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function computeStreak(sessions: LucaSession[]): { days: number } {
  if (sessions.length === 0) return { days: 0 };
  const days = new Set<string>();
  for (const s of sessions) {
    const d = new Date(s.startedAt);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  // crude consecutive-day calculation
  const sortedDays = Array.from(days)
    .map((k) => {
      const [y, m, d] = k.split('-').map(Number);
      return new Date(y, m, d).getTime();
    })
    .sort((a, b) => b - a);

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i - 1] - sortedDays[i] === 86_400_000) streak++;
    else break;
  }
  // only count if most recent day is today or yesterday
  const top = sortedDays[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = (today.getTime() - top) / 86_400_000;
  if (diffDays > 1) return { days: 0 };
  return { days: streak };
}
