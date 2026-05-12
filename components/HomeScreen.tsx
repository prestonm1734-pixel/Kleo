'use client';

import { useEffect, useState } from 'react';
import KleoLogo from './KleoLogo';
import InputBar from './InputBar';
import { User } from '@/types';

interface HomeScreenProps {
  user: User;
  onSendMessage: (text: string, attachments?: File[]) => void;
}

export default function HomeScreen({ user, onSendMessage }: HomeScreenProps) {
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
    <div className="flex flex-col h-full" style={{ background: '#F2F1EE' }}>
      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        {/* KLEO label */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 300,
            letterSpacing: '0.5em',
            color: '#888888',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          KLEO
        </p>

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <KleoLogo size={80} animate bgColor="#F2F1EE" accentColor="#505A98" />
        </div>

        {/* Greeting */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#1A1A1A',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          Welcome back, {user.firstName}.
        </h1>

        {/* Daily insight */}
        <p
          style={{
            fontSize: 14,
            fontWeight: 300,
            color: '#888888',
            textAlign: 'center',
            maxWidth: 320,
            opacity: insightVisible ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          {insight}
        </p>
      </div>

      {/* Input bar pinned to bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-2" style={{ background: '#F2F1EE' }}>
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
