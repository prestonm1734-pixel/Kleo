'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Bell, Shield, CreditCard, Info, LogOut } from 'lucide-react';
import KleoLogo from '@/components/KleoLogo';
import UpgradeModal from '@/components/UpgradeModal';
import { getStoredUser, updateUser, clearStoredUser } from '@/lib/auth';
import { User } from '@/types';

const TIER_INFO = {
  free: { label: 'Free', color: '#8B8B96', bg: 'rgba(255,255,255,0.08)' },
  pro: { label: 'Pro', color: 'white', bg: '#7B6FE8' },
  elite: { label: 'Elite', color: 'white', bg: 'linear-gradient(135deg,#7B6FE8 0%,#5C4FD8 100%)' },
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [notifFinancial, setNotifFinancial] = useState(true);
  const [notifInsights, setNotifInsights] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    setFirstName(u.firstName);
    setLastName(u.lastName);
    setEmail(u.email);
  }, []);

  function handleSaveProfile() {
    if (!user) return;
    const updated = updateUser({ firstName, lastName });
    if (updated) {
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  function handleSignOut() {
    clearStoredUser();
    router.push('/login');
  }

  if (!user) return null;

  const tier = TIER_INFO[user.tier];

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
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#F2F1EE' }}>Settings</h1>
      </div>

      <div className="px-4 pb-16 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* Profile section */}
        <Section title="Profile">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="relative flex items-center justify-center rounded-full text-white text-2xl font-semibold"
              style={{ width: 64, height: 64, background: '#7B6FE8' }}
            >
              {user.firstName[0]}{user.lastName[0]}
              <button
                className="absolute bottom-0 right-0 flex items-center justify-center w-6 h-6 rounded-full"
                style={{ background: '#15151B', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Camera size={12} style={{ color: '#8B8B96' }} />
              </button>
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{user.firstName} {user.lastName}</p>
              <p style={{ fontSize: 13, color: '#8B8B96' }}>{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="flex-1 px-4 py-3 rounded-xl text-sm"
                style={{ background: '#1C1C24', border: 'none', fontSize: 15, fontFamily: 'Inter', outline: 'none' }}
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="flex-1 px-4 py-3 rounded-xl text-sm"
                style={{ background: '#1C1C24', border: 'none', fontSize: 15, fontFamily: 'Inter', outline: 'none' }}
              />
            </div>
            <input
              value={email}
              disabled
              className="w-full px-4 py-3 rounded-xl"
              style={{ background: '#1C1C24', border: 'none', fontSize: 15, fontFamily: 'Inter', color: '#8B8B96', outline: 'none', cursor: 'not-allowed' }}
            />
            <button
              onClick={handleSaveProfile}
              className="py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{ background: saved ? '#3D7A5E' : '#7B6FE8', color: 'white', fontSize: 15 }}
            >
              {saved ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </Section>

        {/* Subscription */}
        <Section title="Subscription" id="subscription">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 16, fontWeight: 600 }}>Current Plan</span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: tier.bg, color: tier.color }}
                >
                  {tier.label}
                </span>
              </div>
              {user.tier === 'free' && (
                <p style={{ fontSize: 13, color: '#8B8B96', marginTop: 4 }}>
                  10 messages/day · Alex only
                </p>
              )}
              {user.tier === 'pro' && (
                <p style={{ fontSize: 13, color: '#8B8B96', marginTop: 4 }}>
                  Unlimited messages · 10 agents
                </p>
              )}
              {user.tier === 'elite' && (
                <p style={{ fontSize: 13, color: '#8B8B96', marginTop: 4 }}>
                  All 17 agents · Unlimited everything
                </p>
              )}
            </div>
          </div>
          {user.tier !== 'elite' && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full py-3 rounded-xl font-medium hover:opacity-90 transition-all"
              style={{ background: '#7B6FE8', color: 'white', fontSize: 15 }}
            >
              {user.tier === 'free' ? 'Upgrade to Pro' : 'Upgrade to Elite'}
            </button>
          )}
          {user.tier !== 'free' && (
            <button
              className="w-full py-3 rounded-xl font-medium mt-2 hover:bg-white/5 transition-all"
              style={{ color: '#C0392B', fontSize: 14 }}
            >
              Cancel subscription
            </button>
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <ToggleRow
            label="Financial alerts"
            description="Unusual spending, bill reminders"
            value={notifFinancial}
            onChange={setNotifFinancial}
          />
          <ToggleRow
            label="Daily insights"
            description="Morning market and financial briefings"
            value={notifInsights}
            onChange={setNotifInsights}
          />
          <ToggleRow
            label="Product updates"
            description="New features and improvements"
            value={notifUpdates}
            onChange={setNotifUpdates}
          />
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <div className="flex flex-col gap-1">
            <SettingsRow icon={<Shield size={16} />} label="Privacy settings" />
            <SettingsRow
              icon={<CreditCard size={16} />}
              label="Connected accounts"
              onClick={() => router.push('/integrations')}
            />
            <button
              className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/5 transition-colors"
              style={{ color: '#C0392B', fontSize: 15 }}
            >
              Delete account
            </button>
          </div>
        </Section>

        {/* About */}
        <Section title="About">
          <div
            className="flex flex-col items-center py-4 text-center"
          >
            <KleoLogo size={40} bgColor="#0B0B0F" accentColor="#7B6FE8" />
            <p style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>Kleo</p>
            <p style={{ fontSize: 12, color: '#8B8B96', marginTop: 2 }}>Version 1.0.0</p>
            <p style={{ fontSize: 12, color: '#8B8B96', marginTop: 1 }}>Built by Deepmarket</p>
            <p
              style={{
                fontSize: 13,
                color: '#8B8B96',
                marginTop: 12,
                lineHeight: 1.5,
                maxWidth: 260,
              }}
            >
              Financial intelligence has always belonged to the wealthy. We built Kleo to change that.
            </p>
          </div>
        </Section>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl hover:bg-white/5 transition-colors"
          style={{ color: '#8B8B96', fontSize: 15 }}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>

      {showUpgrade && user && (
        <UpgradeModal
          user={user}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={(tier) => {
            const updated = updateUser({ tier });
            if (updated) setUser(updated);
          }}
        />
      )}
    </div>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id}>
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
        {title}
      </p>
      <div
        className="rounded-2xl p-4"
        style={{ background: '#15151B', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none' }}
      >
        {children}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p style={{ fontSize: 15, color: '#F2F1EE' }}>{label}</p>
        <p style={{ fontSize: 12, color: '#8B8B96' }}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative flex-shrink-0"
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          background: value ? '#7B6FE8' : 'rgba(255,255,255,0.12)',
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: value ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: 10,
            background: 'white',
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-1 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
    >
      <span style={{ color: '#8B8B96' }}>{icon}</span>
      <span style={{ fontSize: 15, color: '#F2F1EE' }}>{label}</span>
    </button>
  );
}
