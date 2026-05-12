import { useEffect, useState } from 'react';
import KleoLogo from './KleoLogo';
import InputBar from './InputBar';
import { User } from '../types';

interface HomeScreenProps {
  user: User;
  onSendMessage: (text: string, attachments?: File[]) => void;
}

const FALLBACK_INSIGHTS = [
  'Markets are shifting ahead of this week. Worth a conversation.',
  'Your money does not sleep. Neither does Kleo.',
  'Something moved overnight. Ask me about it.',
  'Small moves compound. The best time to review is now.',
  'Rates are telling a story. Want to know what it means for you?',
  'One conversation can change your financial trajectory.',
  'The wealthiest people have advisors. Now so do you.',
  'Your net worth is a number you can change. Ask me how.',
];

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
      } else {
        throw new Error('Failed');
      }
    } catch {
      const fallback = FALLBACK_INSIGHTS[Math.floor(Math.random() * FALLBACK_INSIGHTS.length)];
      setInsight(fallback);
      setTimeout(() => setInsightVisible(true), 300);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#F2F1EE' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
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

        <div style={{ marginBottom: 28 }}>
          <KleoLogo size={80} animate bgColor="#F2F1EE" accentColor="#505A98" />
        </div>

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
