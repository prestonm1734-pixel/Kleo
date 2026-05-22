'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { LucaSession } from '@/types';
import { formatMoney, formatTimeAgo, getSessions, lifetimeSavings } from '@/lib/luca';

interface LucaLogDrawerProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Full session history drawer. Triggered by tapping the status dot.
 * Shows every Luca mission, its steps, and its findings.
 */
export default function LucaLogDrawer({ userId, open, onClose }: LucaLogDrawerProps) {
  const [sessions, setSessions] = useState<LucaSession[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSessions(getSessions(userId));
  }, [open, userId]);

  if (!open) return null;

  const total = lifetimeSavings(userId);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 70,
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        className="toast-slide-in"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(440px, 100vw)',
          background: '#0F0F14',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          zIndex: 71,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 18px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Sparkles size={16} style={{ color: '#9D8FFF' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#F2F1EE', letterSpacing: '0.02em' }}>
              Luca Mission Log
            </p>
            <p style={{ fontSize: 11, color: '#8B8B96', marginTop: 2 }}>
              {sessions.length} run{sessions.length === 1 ? '' : 's'} · {formatMoney(total)} lifetime opportunities
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              color: '#8B8B96',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Sessions */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {sessions.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: '#5A5A66' }}>
              <p style={{ fontSize: 13 }}>No missions yet.</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Run Luca and watch it work.</p>
            </div>
          )}

          {sessions.map((s) => {
            const isOpen = expanded === s.id;
            return (
              <div
                key={s.id}
                style={{
                  background: '#15151B',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  marginBottom: 10,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                  className="w-full"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: s.status === 'complete' ? '#9D8FFF' : s.status === 'error' ? '#FF6B6B' : '#5A5A66',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, color: '#F2F1EE', fontWeight: 500 }}>
                      {formatTimeAgo(s.completedAt ?? s.startedAt)}
                    </p>
                    <p style={{ fontSize: 11, color: '#8B8B96', marginTop: 1 }}>
                      {s.steps.length} steps · {s.findings.length} finding{s.findings.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span style={{ color: '#9D8FFF', fontWeight: 700, fontSize: 14 }}>
                    {formatMoney(s.totalValue)}
                  </span>
                </button>

                {isOpen && (
                  <div style={{ padding: '4px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {s.findings.map((f) => (
                      <div
                        key={f.id}
                        style={{
                          padding: '8px 0',
                          fontSize: 12,
                          color: '#8B8B96',
                          borderBottom: '1px dashed rgba(255,255,255,0.05)',
                        }}
                      >
                        <span style={{ color: '#F2F1EE' }}>{f.title}</span>
                        <span style={{ color: '#9D8FFF', marginLeft: 8, fontWeight: 600 }}>
                          +${f.amount.toFixed(f.amount < 100 ? 2 : 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
