'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import KleoLogo from './KleoLogo';
import { User } from '@/types';
import { updateUser } from '@/lib/auth';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: (tier: 'pro' | 'elite') => void;
  user: User;
}

const PRO_FEATURES = [
  'Unlimited conversations with Kleo',
  'Connect your bank accounts',
  'Personalized advice with your real numbers',
  'Tax, investing, debt, real estate and more',
  '10 file uploads per day',
  'PDF exports of financial plans',
];

const ELITE_FEATURES = [
  'Everything in Pro',
  'Business Intelligence CFO Room',
  'Live cash, runway, and tax tracking',
  '13-week forecast and what-if simulator',
  'Business finances and cash flow',
  'Meeting intelligence',
  'Priority access and support',
  'All integrations unlocked',
];

const PRICES = {
  pro:   { monthly: 24.99, annual: 199,  annualMonthly: (199  / 12).toFixed(2), save: '$100' },
  elite: { monthly: 97.99, annual: 799,  annualMonthly: (799  / 12).toFixed(2), save: '$376' },
};

export default function UpgradeModal({ onClose, onUpgrade, user }: UpgradeModalProps) {
  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual');
  const [selected, setSelected] = useState<'pro' | 'elite'>('pro');

  function handleUpgrade() {
    updateUser({ tier: selected });
    onUpgrade(selected);
    onClose();
  }

  const price = PRICES[selected];
  const displayPrice = billing === 'annual' ? price.annualMonthly : price.monthly.toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-sm animate-slide-up sm:animate-fade-in overflow-y-auto"
        style={{
          background: '#15151B',
          borderRadius: '24px 24px 0 0',
          padding: '32px 24px 40px',
          maxHeight: '92vh',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5"
        >
          <X size={18} style={{ color: '#8B8B96' }} />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <KleoLogo size={48} bgColor="#15151B" accentColor="#7B6FE8" interactive />
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: 21, fontWeight: 600, color: '#F2F1EE', textAlign: 'center', marginBottom: 8 }}>
          Your personal CFO. Unlimited.
        </h2>
        <p style={{ fontSize: 14, color: '#8B8B96', textAlign: 'center', marginBottom: 24 }}>
          Kleo knows your complete financial life and tells you exactly what to do.
        </p>

        {/* Billing toggle */}
        <div
          className="flex items-center p-1 rounded-full mx-auto mb-2"
          style={{ background: '#22222C', width: 'fit-content' }}
        >
          {(['monthly', 'annual'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className="px-4 py-1.5 rounded-full text-sm transition-all"
              style={{
                background: billing === b ? '#7B6FE8' : 'transparent',
                color: billing === b ? 'white' : '#8B8B96',
                fontWeight: billing === b ? 500 : 400,
              }}
            >
              {b === 'monthly' ? 'Monthly' : 'Annual'}
            </button>
          ))}
        </div>
        {billing === 'annual' && (
          <p style={{ fontSize: 12, color: '#6FCF97', textAlign: 'center', marginBottom: 16 }}>
            Save more with annual billing
          </p>
        )}

        {/* Plan cards */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Pro */}
          <button
            onClick={() => setSelected('pro')}
            className="text-left p-4 rounded-2xl transition-all"
            style={{
              background: '#22222C',
              border: `2px solid ${selected === 'pro' ? '#7B6FE8' : 'transparent'}`,
              boxShadow: '0 1px 4px rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16, fontWeight: 600 }}>Pro</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#7B6FE8', color: 'white' }}>
                    Most Popular
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span style={{ fontSize: 22, fontWeight: 700 }}>${billing === 'annual' ? PRICES.pro.annualMonthly : PRICES.pro.monthly}</span>
                  <span style={{ fontSize: 13, color: '#8B8B96' }}>/mo</span>
                  {billing === 'annual' && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(61,122,94,0.1)', color: '#6FCF97' }}>
                      {PRICES.pro.save}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1"
                style={{ borderColor: selected === 'pro' ? '#7B6FE8' : '#3A3A44', background: selected === 'pro' ? '#7B6FE8' : 'transparent' }}>
                {selected === 'pro' && <Check size={12} color="white" />}
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={13} style={{ color: '#7B6FE8', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#F2F1EE' }}>{f}</span>
                </div>
              ))}
            </div>
          </button>

          {/* Elite */}
          <button
            onClick={() => setSelected('elite')}
            className="text-left p-4 rounded-2xl transition-all"
            style={{
              background: '#22222C',
              border: `2px solid ${selected === 'elite' ? '#7B6FE8' : 'transparent'}`,
              boxShadow: '0 1px 4px rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16, fontWeight: 600 }}>Elite</span>
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#22222C', color: '#8B8B96' }}>
                    For Business
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span style={{ fontSize: 22, fontWeight: 700 }}>${billing === 'annual' ? PRICES.elite.annualMonthly : PRICES.elite.monthly}</span>
                  <span style={{ fontSize: 13, color: '#8B8B96' }}>/mo</span>
                  {billing === 'annual' && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(61,122,94,0.1)', color: '#6FCF97' }}>
                      {PRICES.elite.save}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1"
                style={{ borderColor: selected === 'elite' ? '#7B6FE8' : '#3A3A44', background: selected === 'elite' ? '#7B6FE8' : 'transparent' }}>
                {selected === 'elite' && <Check size={12} color="white" />}
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {ELITE_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={13} style={{ color: '#7B6FE8', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#F2F1EE' }}>{f}</span>
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90"
          style={{ background: '#7B6FE8' }}
        >
          Get Full Access — ${displayPrice}/mo
        </button>

        <button
          onClick={onClose}
          style={{ fontSize: 13, color: '#8B8B96', display: 'block', margin: '14px auto 0', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
