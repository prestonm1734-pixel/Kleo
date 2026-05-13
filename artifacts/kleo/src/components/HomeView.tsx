import Composer from './Composer';
import Sparkline from './Sparkline';
import Icon from './Icon';
import { FinancialData } from '../types';

const PLACEHOLDER_DATA: FinancialData = {
  netWorth: 148302,
  netWorthChangePct: 2.14,
  cashOnHand: 12448,
  accountCount: 4,
  burnRate: 4829,
  burnRateChangePct: -6.2,
  sparkData: [42, 44, 41, 47, 45, 49, 52, 50, 54, 58, 56, 61],
  isPlaid: false,
};

const SUGGESTIONS = [
  { icon: 'coin', t: 'Am I on track for retirement at 55?', d: 'Based on your current savings rate and projected returns' },
  { icon: 'chart', t: 'Where did my money go this month?', d: 'Spending breakdown across all linked accounts' },
  { icon: 'target', t: 'How fast can I pay off my debt?', d: 'Payoff timeline with avalanche vs. snowball strategies' },
  { icon: 'plant', t: 'Should I open a Roth IRA this year?', d: 'Income limits, tax strategy, and contribution advice' },
];

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

interface HomeViewProps {
  firstName: string;
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  financialData?: FinancialData;
}

export default function HomeView({ firstName, draft, setDraft, onSend, financialData }: HomeViewProps) {
  const hour = new Date().getHours();
  const greet = greetingFor(hour);
  const data = financialData ?? PLACEHOLDER_DATA;

  return (
    <div className="home-wrap">
      <div className="home">
        <h1 className="greeting">
          {greet}, <span className="italic">{firstName}.</span>
        </h1>
        <p className="subgreet">
          {data.isPlaid
            ? `You're tracking ${data.netWorthChangePct > 0 ? `+${data.netWorthChangePct}%` : `${data.netWorthChangePct}%`} net worth this month. What would you like to work on?`
            : "Your financial co-pilot is ready. Ask me anything about your money, or connect your accounts for personalized insights."}
        </p>

        <Composer value={draft} onChange={setDraft} onSend={onSend} autoFocus />

        <div className="glance">
          <div className="gl-card">
            <div className="gl-label">Net worth · this month</div>
            <div className="gl-value">
              ${fmt(Math.floor(data.netWorth))}
              <span className="cents">.{String(Math.round((data.netWorth % 1) * 100)).padStart(2, '0')}</span>
            </div>
            <div className="gl-trend">
              <span className={data.netWorthChangePct >= 0 ? 'up' : 'down'}>
                {data.netWorthChangePct >= 0 ? '▲' : '▼'} {Math.abs(data.netWorthChangePct)}%
              </span>
              <span style={{ color: 'var(--ink-4)' }}>vs. last month</span>
            </div>
            <div className="spark" style={{ color: 'var(--accent)' }}>
              <Sparkline data={data.sparkData} width={220} height={32} />
            </div>
          </div>

          <div className="gl-card">
            <div className="gl-label">Cash on hand</div>
            <div className="gl-value">${fmt(data.cashOnHand)}</div>
            <div className="gl-trend">
              <span style={{ color: 'var(--ink-3)' }}>{data.accountCount} accounts</span>
            </div>
          </div>

          <div className="gl-card">
            <div className="gl-label">Burn rate · 30d</div>
            <div className="gl-value">${fmt(data.burnRate)}</div>
            <div className="gl-trend">
              <span className={data.burnRateChangePct <= 0 ? 'up' : 'down'}>
                {data.burnRateChangePct <= 0 ? '▼' : '▲'} {Math.abs(data.burnRateChangePct)}%
              </span>
              <span style={{ color: 'var(--ink-4)' }}>
                {data.burnRateChangePct <= 0 ? 'tighter than last month' : 'higher than last month'}
              </span>
            </div>
          </div>
        </div>

        {!data.isPlaid && (
          <div className="plaid-banner">
            <div className="txt">
              <strong>Connect your accounts</strong> — link your bank, credit cards, and investments for real data and personalized advice.
            </div>
            <button className="plaid-btn">Connect with Plaid</button>
          </div>
        )}

        <div className="suggestions">
          <div className="sg-head">
            <h3>Things you might ask</h3>
            <span className="more">based on your financial profile</span>
          </div>
          <div className="sg-grid">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="sg-card" onClick={() => setDraft(s.t)}>
                <div className="ic"><Icon name={s.icon} size={20} stroke={1.4} /></div>
                <div className="t">{s.t}</div>
                <div className="d">{s.d}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
