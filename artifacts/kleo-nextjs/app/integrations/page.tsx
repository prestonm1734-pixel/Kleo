'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import { getStoredUser } from '@/lib/auth';
import { User } from '@/types';

interface Integration {
  id: string;
  name: string;
  description: string;
  reads: string;
  powers: string;
  tier: 'free' | 'pro' | 'elite';
  category: string;
  icon: string;
  connected?: boolean;
}

const INTEGRATIONS: Integration[] = [
  // Banking
  { id: 'plaid', name: 'Plaid', description: 'Connect your bank accounts', reads: 'Transactions, balances, spending patterns', powers: 'Kleo', tier: 'pro', category: 'Banking', icon: '🏦' },
  // Email
  { id: 'gmail', name: 'Gmail', description: 'Scan financial emails', reads: 'Bills, statements, receipts', powers: 'Kleo', tier: 'pro', category: 'Email', icon: '✉️' },
  { id: 'outlook', name: 'Outlook', description: 'Scan financial emails', reads: 'Bills, statements, receipts', powers: 'Kleo', tier: 'pro', category: 'Email', icon: '📧' },
  // Calendar
  { id: 'gcal', name: 'Google Calendar', description: 'Track financial events', reads: 'Bill due dates, financial appointments', powers: 'Kleo', tier: 'pro', category: 'Calendar', icon: '📅' },
  { id: 'apple-cal', name: 'Apple Calendar', description: 'Track financial events', reads: 'Bill due dates, financial appointments', powers: 'Kleo', tier: 'pro', category: 'Calendar', icon: '🍎' },
  // Documents
  { id: 'gdrive', name: 'Google Drive', description: 'Analyze financial documents', reads: 'Statements, contracts, tax docs', powers: 'Kleo', tier: 'pro', category: 'Documents', icon: '📁' },
  { id: 'dropbox', name: 'Dropbox', description: 'Analyze financial documents', reads: 'Statements, contracts, tax docs', powers: 'Kleo', tier: 'pro', category: 'Documents', icon: '📦' },
  // Investing
  { id: 'polygon', name: 'Polygon.io', description: 'Real-time market data', reads: 'Stock prices, market data, technicals', powers: 'Kleo', tier: 'free', category: 'Investing', icon: '📈' },
  { id: 'finnhub', name: 'Finnhub', description: 'Analyst data & earnings', reads: 'Analyst ratings, price targets, earnings', powers: 'Kleo', tier: 'free', category: 'Investing', icon: '🔬' },
  // Crypto
  { id: 'coinbase', name: 'Coinbase', description: 'Crypto portfolio tracking', reads: 'Holdings, transactions, performance', powers: 'Kleo', tier: 'elite', category: 'Crypto', icon: '₿' },
  // Tax
  { id: 'turbotax', name: 'TurboTax', description: 'Tax document analysis', reads: 'Prior returns, deductions history', powers: 'Kleo', tier: 'pro', category: 'Tax', icon: '🧾' },
  // Real Estate
  { id: 'zillow', name: 'Zillow', description: 'Property valuations', reads: 'Home values, rental estimates, market data', powers: 'Kleo', tier: 'pro', category: 'Real Estate', icon: '🏠' },
  // Credit
  { id: 'experian', name: 'Experian', description: 'Credit monitoring', reads: 'Credit score, report, alerts', powers: 'Kleo', tier: 'pro', category: 'Credit', icon: '💳' },
  { id: 'equifax', name: 'Equifax', description: 'Credit monitoring', reads: 'Credit score, report, alerts', powers: 'Kleo', tier: 'pro', category: 'Credit', icon: '🏅' },
  // Business (Elite)
  { id: 'quickbooks', name: 'QuickBooks', description: 'Business accounting', reads: 'P&L, cash flow, expenses, payroll', powers: 'Kleo', tier: 'elite', category: 'Business', icon: '📊' },
  { id: 'stripe', name: 'Stripe', description: 'Payment & revenue data', reads: 'Revenue, MRR, customer metrics', powers: 'Kleo', tier: 'elite', category: 'Business', icon: '💸' },
  { id: 'shopify', name: 'Shopify', description: 'E-commerce analytics', reads: 'Sales, margins, inventory', powers: 'Kleo', tier: 'elite', category: 'Business', icon: '🛍️' },
  { id: 'gusto', name: 'Gusto', description: 'Payroll & HR data', reads: 'Payroll costs, benefits, headcount', powers: 'Kleo', tier: 'elite', category: 'Business', icon: '👥' },
  // Meetings (Elite)
  { id: 'zoom', name: 'Zoom', description: 'Meeting summaries', reads: 'Financial meeting notes', powers: 'Kleo', tier: 'elite', category: 'Meetings', icon: '📹' },
  { id: 'meet', name: 'Google Meet', description: 'Meeting summaries', reads: 'Financial meeting notes', powers: 'Kleo', tier: 'elite', category: 'Meetings', icon: '🎥' },
  { id: 'teams', name: 'Teams', description: 'Meeting summaries', reads: 'Financial meeting notes', powers: 'Kleo', tier: 'elite', category: 'Meetings', icon: '💼' },
  // Free APIs
  { id: 'fred', name: 'FRED (Federal Reserve)', description: 'Economic indicators', reads: 'Fed funds rate, CPI, GDP, unemployment', powers: 'Kleo', tier: 'free', category: 'Economics', icon: '🏛️' },
  { id: 'bls', name: 'Bureau of Labor Statistics', description: 'Labor market data', reads: 'CPI, unemployment, wage growth', powers: 'Kleo', tier: 'free', category: 'Economics', icon: '📉' },
  { id: 'newsapi', name: 'NewsAPI', description: 'Financial news feed', reads: 'Market news, company news, economic news', powers: 'Kleo', tier: 'free', category: 'News', icon: '📰' },
];

const CATEGORIES = ['Banking', 'Email', 'Calendar', 'Documents', 'Investing', 'Crypto', 'Tax', 'Real Estate', 'Credit', 'Business', 'Meetings', 'Economics', 'News'];

export default function IntegrationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [connected, setConnected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const u = getStoredUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    // Load connected state
    const stored = localStorage.getItem(`kleo_integrations_${u.id}`);
    if (stored) {
      try { setConnected(new Set(JSON.parse(stored))); } catch {}
    }
  }, []);

  function toggleConnect(id: string, tier: Integration['tier']) {
    if (!user) return;
    if (isLocked(tier)) return;
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(`kleo_integrations_${user.id}`, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  function isLocked(tier: Integration['tier']): boolean {
    if (!user) return true;
    if (tier === 'free') return false;
    if (tier === 'pro') return user.tier === 'free';
    return user.tier !== 'elite';
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-full overflow-y-auto" style={{ background: '#0B0B0F' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-4 sticky top-0 z-10"
        style={{ background: '#0B0B0F' }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={20} style={{ color: '#F2F1EE' }} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#F2F1EE' }}>Integrations</h1>
      </div>

      <div className="px-4 pb-16 max-w-lg mx-auto w-full">
        {CATEGORIES.map((cat) => {
          const catIntegrations = INTEGRATIONS.filter((i) => i.category === cat);
          if (catIntegrations.length === 0) return null;
          return (
            <div key={cat} className="mb-5">
              <p
                style={{
                  fontSize: 11,
                  color: '#8B8B96',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 8,
                  paddingLeft: 4,
                }}
              >
                {cat}
              </p>
              <div className="flex flex-col gap-2">
                {catIntegrations.map((integration) => {
                  const locked = isLocked(integration.tier);
                  const isConnected = connected.has(integration.id);
                  return (
                    <div
                      key={integration.id}
                      className="rounded-2xl p-4"
                      style={{
                        background: '#15151B',
                        border: '1px solid rgba(255,255,255,0.05)',
                        opacity: locked ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span style={{ fontSize: 24 }}>{integration.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: 15, fontWeight: 600 }}>{integration.name}</span>
                              {locked && (
                                <span
                                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs"
                                  style={{ background: 'rgba(255,255,255,0.06)', color: '#8B8B96' }}
                                >
                                  <Lock size={9} />
                                  {integration.tier === 'elite' ? ' Elite' : ' Pro'}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 12, color: '#8B8B96', marginTop: 1 }}>{integration.reads}</p>
                            <p style={{ fontSize: 11, color: '#9D8FFF', marginTop: 2 }}>
                              Powers: {integration.powers}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleConnect(integration.id, integration.tier)}
                          disabled={locked}
                          className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                          style={{
                            background: isConnected
                              ? 'rgba(111,207,151,0.14)'
                              : locked
                              ? 'rgba(255,255,255,0.05)'
                              : 'rgba(123,111,232,0.16)',
                            color: isConnected ? '#6FCF97' : locked ? '#5A5A66' : '#9D8FFF',
                            cursor: locked ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isConnected ? (
                            <span className="flex items-center gap-1">
                              <Check size={11} /> Connected
                            </span>
                          ) : locked ? (
                            'Locked'
                          ) : (
                            'Connect'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Privacy note */}
        <div
          className="mt-2 p-4 rounded-2xl text-center"
          style={{ background: 'rgba(123,111,232,0.08)', border: '1px solid rgba(123,111,232,0.14)' }}
        >
          <p style={{ fontSize: 12, color: '#8B8B96', lineHeight: 1.6 }}>
            🔒 Kleo never sells or shares your data. All connections are read-only. Disconnect any time.
          </p>
        </div>
      </div>
    </div>
  );
}
