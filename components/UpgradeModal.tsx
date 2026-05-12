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
  '10 personal finance agents',
  'Unlimited messages',
  'Connect up to 3 bank accounts',
  '10 file uploads per day',
  'PDF document exports',
  'Priority support',
];

const ELITE_FEATURES = [
  'All 17 agents including Business & Markets',
  'Unlimited everything',
  'All integrations',
  'Business & crypto advisors',
  'Options and macro strategists',
  'White glove support',
];

export default function UpgradeModal({ onClose, onUpgrade, user }: UpgradeModalProps) {
  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual');
  const [selected, setSelected] = useState<'pro' | 'elite'>('pro');

  const priceMap = {
    pro: { monthly: 24.99, annual: 199, annualMonthly: (199 / 12).toFixed(2) },
    elite: { monthly: 97.99, annual: 799, annualMonthly: (799 / 12).toFixed(2) },
  };

  function handleUpgrade() {
    updateUser({ tier: selected });
    onUpgrade(selected);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-sm animate-slide-up sm:animate-fade-in"
        style={{
          background: '#F2F1EE',
          borderRadius: '24px 24px 0 0',
          padding: '32px 24px 40px',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5"
        >
          <X size={18} style={{ color: '#888888' }} />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <KleoLogo size={52} bgColor="#F2F1EE" accentColor="#505A98" />
        </div>

        {/* Heading */}
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#1A1A1A',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Your own Wall Street advisor. Unlimited.
        </h2>
        <p
          style={{
            fontSize: 14,
            color: '#888888',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          The financial intelligence Wall Street kept to themselves. Now yours.
        </p>

        {/* Billing toggle */}
        <div
          className="flex items-center justify-center mb-6 gap-1 p-1 rounded-full"
          style={{ background: '#ECEAE4', width: 'fit-content', margin: '0 auto 24px' }}
        >
          {(['monthly', 'annual'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className="px-4 py-1.5 rounded-full text-sm transition-all"
              style={{
                background: billing === b ? '#505A98' : 'transparent',
                color: billing === b ? 'white' : '#888888',
                fontWeight: billing === b ? 500 : 400,
              }}
            >
              {b === 'monthly' ? 'Monthly' : 'Annual'}
            </button>
          ))}
        </div>
        {billing === 'annual' && (
          <p style={{ fontSize: 12, color: '#3D7A5E', textAlign: 'center', marginBottom: 16, marginTop: -16 }}>
            Save more with annual billing
          </p>
        )}

        {/* Plan cards */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Pro card */}
          <button
            onClick={() => setSelected('pro')}
            className="text-left p-4 rounded-2xl transition-all"
            style={{
              background: 'white',
              border: selected === 'pro' ? '2px solid #505A98' : '2px solid transparent',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16, fontWeight: 600 }}>Pro</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: '#505A98', color: 'white' }}
                  >
                    Most Popular
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span style={{ fontSize: 22, fontWeight: 700 }}>
                    ${billing === 'annual' ? priceMap.pro.annualMonthly : priceMap.pro.monthly}
                  </span>
                  <span style={{ fontSize: 13, color: '#888888' }}>/mo</span>
                  {billing === 'annual' && (
                    <span
                      className="ml-1 px-1.5 py-0.5 rounded text-xs"
                      style={{ background: 'rgba(61,122,94,0.1)', color: '#3D7A5E' }}
                    >
                      Save $100
                    </span>
                  )}
                </div>
              </div>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1"
                style={{
                  borderColor: selected === 'pro' ? '#505A98' : '#CCCCCC',
                  background: selected === 'pro' ? '#505A98' : 'transparent',
                }}
              >
                {selected === 'pro' && <Check size={12} color="white" />}
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={13} style={{ color: '#505A98', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#1A1A1A' }}>{f}</span>
                </div>
              ))}
            </div>
          </button>

          {/* Elite card */}
          <button
            onClick={() => setSelected('elite')}
            className="text-left p-4 rounded-2xl transition-all"
            style={{
              background: 'white',
              border: selected === 'elite' ? '2px solid #505A98' : '2px solid transparent',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16, fontWeight: 600 }}>Elite</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: '#ECEAE4', color: '#888888' }}
                  >
                    For Business
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span style={{ fontSize: 22, fontWeight: 700 }}>
                    ${billing === 'annual' ? priceMap.elite.annualMonthly : priceMap.elite.monthly}
                  </span>
                  <span style={{ fontSize: 13, color: '#888888' }}>/mo</span>
                  {billing === 'annual' && (
                    <span
                      className="ml-1 px-1.5 py-0.5 rounded text-xs"
                      style={{ background: 'rgba(61,122,94,0.1)', color: '#3D7A5E' }}
                    >
                      Save $376
                    </span>
                  )}
                </div>
              </div>
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1"
                style={{
                  borderColor: selected === 'elite' ? '#505A98' : '#CCCCCC',
                  background: selected === 'elite' ? '#505A98' : 'transparent',
                }}
              >
                {selected === 'elite' && <Check size={12} color="white" />}
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {ELITE_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check size={13} style={{ color: '#505A98', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#1A1A1A' }}>{f}</span>
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-all hover:opacity-90"
          style={{ background: '#505A98' }}
        >
          Get Full Access — ${billing === 'annual' ? priceMap[selected].annualMonthly : priceMap[selected].monthly}/mo
        </button>

        <button
          onClick={onClose}
          style={{ fontSize: 13, color: '#888888', display: 'block', margin: '16px auto 0', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
