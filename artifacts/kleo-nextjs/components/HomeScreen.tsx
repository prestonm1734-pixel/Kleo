'use client';

import { useEffect, useState } from 'react';
import { Menu, Sparkles, Play } from 'lucide-react';
import KleoLogo from './KleoLogo';
import InputBar from './InputBar';
import { User } from '@/types';

interface HomeScreenProps {
  user: User;
  onSendMessage: (text: string, attachments?: File[]) => void;
  onOpenMobileSidebar: () => void;
  onRunLuca?: () => void;
  lucaIsRunning?: boolean;
}

export default function HomeScreen({
  user,
  onSendMessage,
  onOpenMobileSidebar,
  onRunLuca,
  lucaIsRunning,
}: HomeScreenProps) {
  const [insight, setInsight] = useState('');
  const [insightVisible, setInsightVisible] = useState(false);

  useEffect(() => {
    fetchInsight();
  }, []);

  async function fetchInsight() {
    try {
      const res = await fetch('/api/insight');
      if (res.ok) {
        const data = await res.json();
        setInsight(data.insight || '');
        setTimeout(() => setInsightVisible(true), 300);
      }
    } catch {
      setInsight('Your money works 24/7. Make sure it has a plan.');
      setTimeout(() => setInsightVisible(true), 300);
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#0B0B0F' }}
    >
      {/* Mobile-only top bar with hamburger */}
      <div className="sidebar-hamburger flex items-center px-4 pt-3 pb-1 flex-shrink-0">
        <button
          onClick={onOpenMobileSidebar}
          className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
          style={{ color: '#8B8B96' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu size={19} />
        </button>
      </div>

      {/* Centered content */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8"
        style={{ paddingBottom: 32 }}
      >
        {/* KLEO label */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: '0.5em',
            color: '#5A5A66',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          KLEO
        </p>

        {/* Logo */}
        <div style={{ marginBottom: 24 }}>
          <KleoLogo size={68} bgColor="#0B0B0F" accentColor="#9D8FFF" interactive />
        </div>

        {/* Greeting */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: '#F2F1EE',
            marginBottom: 10,
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}
        >
          Welcome back, {user.firstName}.
        </h1>

        {/* Daily insight */}
        <p
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: '#8B8B96',
            textAlign: 'center',
            maxWidth: 320,
            lineHeight: 1.55,
            opacity: insightVisible ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out',
            marginBottom: 22,
          }}
        >
          {insight}
        </p>

        {/* Run Luca CTA */}
        {onRunLuca && (
          <button
            onClick={onRunLuca}
            disabled={lucaIsRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '11px 20px',
              borderRadius: 999,
              background: lucaIsRunning
                ? 'rgba(123,111,232,0.18)'
                : 'linear-gradient(135deg, #7B6FE8 0%, #5C4FD8 100%)',
              color: 'white',
              fontSize: 13.5,
              fontWeight: 600,
              boxShadow: lucaIsRunning ? 'none' : '0 6px 24px rgba(123,111,232,0.32)',
              cursor: lucaIsRunning ? 'default' : 'pointer',
            }}
          >
            {lucaIsRunning ? (
              <>
                <span
                  className="luca-pulse"
                  style={{ width: 8, height: 8, borderRadius: 999, background: '#9D8FFF' }}
                />
                Luca is scanning...
              </>
            ) : (
              <>
                <Play size={13} />
                Run Luca now
                <span
                  style={{
                    fontSize: 10,
                    background: 'rgba(255,255,255,0.18)',
                    padding: '2px 7px',
                    borderRadius: 999,
                    letterSpacing: '0.06em',
                  }}
                >
                  <Sparkles size={9} style={{ display: 'inline', marginRight: 3 }} />
                  AUTONOMOUS
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Input bar pinned to bottom */}
      <div
        className="flex-shrink-0"
        style={{ padding: '0 16px 28px', background: '#0B0B0F' }}
      >
        <InputBar
          onSend={onSendMessage}
          placeholder="Ask me anything about your finances..."
          tier={user.tier}
          messageCount={user.messageCount}
          messageCountDate={user.messageCountDate}
        />
      </div>
    </div>
  );
}
