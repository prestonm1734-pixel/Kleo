'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import KleoLogo from './KleoLogo';
import InputBar from './InputBar';
import { User } from '@/types';

interface HomeScreenProps {
  user: User;
  onSendMessage: (text: string, attachments?: File[]) => void;
  onOpenMobileSidebar: () => void;
}

export default function HomeScreen({ user, onSendMessage, onOpenMobileSidebar }: HomeScreenProps) {
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
      style={{ background: '#F2F1EE' }}
    >
      {/* Mobile-only top bar with hamburger */}
      <div
        className="sidebar-hamburger flex items-center px-4 pt-3 pb-1 flex-shrink-0"
      >
        <button
          onClick={onOpenMobileSidebar}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-colors"
        >
          <Menu size={19} style={{ color: '#555' }} />
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
            color: '#AAAAAA',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          KLEO
        </p>

        {/* Logo — interactive with breathing segments */}
        <div style={{ marginBottom: 24 }}>
          <KleoLogo
            size={68}
            bgColor="#F2F1EE"
            accentColor="#505A98"
            interactive
          />
        </div>

        {/* Greeting */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: '#1A1A1A',
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
            color: '#999999',
            textAlign: 'center',
            maxWidth: 300,
            lineHeight: 1.55,
            opacity: insightVisible ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out',
          }}
        >
          {insight}
        </p>
      </div>

      {/* Input bar pinned to bottom of right column */}
      <div
        className="flex-shrink-0"
        style={{ padding: '0 16px 28px', background: '#F2F1EE' }}
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
