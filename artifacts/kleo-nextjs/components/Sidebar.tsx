'use client';

import { X, Plus, LogOut, Settings, Plug, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { User, Conversation, LucaSession } from '@/types';
import { clearStoredUser } from '@/lib/auth';
import { deleteConversation } from '@/lib/conversations';
import KleoLogo from './KleoLogo';
import LucaMissionLog from './LucaMissionLog';

interface SidebarProps {
  mode: 'desktop' | 'mobile-overlay';
  user: User;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onConversationsChange: () => void;
  onClose?: () => void;
  // Luca
  lucaIsRunning?: boolean;
  lucaPastSessions?: LucaSession[];
  onRunLuca?: () => void;
  onOpenLucaLog?: () => void;
}

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  free:  { bg: 'rgba(255,255,255,0.08)', text: '#8B8B96' },
  pro:   { bg: '#7B6FE8',                text: 'white'   },
  elite: { bg: 'linear-gradient(135deg,#7B6FE8 0%, #5C4FD8 100%)', text: 'white' },
};

export default function Sidebar({
  mode,
  user,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onConversationsChange,
  onClose,
  lucaIsRunning = false,
  lucaPastSessions = [],
  onRunLuca,
  onOpenLucaLog,
}: SidebarProps) {
  const router = useRouter();
  const tierStyle = TIER_COLORS[user.tier] || TIER_COLORS.free;

  function handleSignOut() {
    clearStoredUser();
    router.push('/login');
  }

  function handleDeleteConversation(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteConversation(user.id, id);
    onConversationsChange();
  }

  function nav(path: string) {
    router.push(path);
    onClose?.();
  }

  const panel = (
    <div
      className="flex flex-col h-full"
      style={{
        width: mode === 'desktop' ? 272 : '80vw',
        maxWidth: mode === 'desktop' ? 272 : 320,
        background: '#0F0F14',
        borderRight: mode === 'desktop' ? '1px solid rgba(255,255,255,0.06)' : 'none',
        flexShrink: 0,
      }}
    >
      {/* ── Top: logo + new chat ── */}
      <div style={{ padding: mode === 'desktop' ? '20px 14px 14px' : '52px 14px 14px' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <KleoLogo size={26} bgColor="#0F0F14" accentColor="#9D8FFF" interactive />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: '#F2F1EE',
                textTransform: 'uppercase',
              }}
            >
              Kleo
            </span>
          </div>
          {mode === 'mobile-overlay' && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
              style={{ color: '#8B8B96' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* New conversation */}
        <button
          onClick={() => { onNewConversation(); onClose?.(); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
          style={{ background: 'rgba(123,111,232,0.12)', color: '#9D8FFF', fontSize: 13, fontWeight: 500 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(123,111,232,0.22)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(123,111,232,0.12)')}
        >
          <Plus size={15} />
          New conversation
        </button>
      </div>

      {/* ── Luca mission log ── */}
      {onRunLuca && (
        <>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px' }} />
          <LucaMissionLog
            userId={user.id}
            pastSessions={lucaPastSessions}
            isRunning={lucaIsRunning}
            onRun={() => { onRunLuca?.(); onClose?.(); }}
            onOpenSession={() => { onOpenLucaLog?.(); onClose?.(); }}
          />
        </>
      )}

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px' }} />

      {/* ── Recents (flex-1, scrollable) ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '8px 8px' }}>
        <p
          style={{
            fontSize: 10,
            color: '#5A5A66',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            padding: '4px 8px 6px',
          }}
        >
          Recents
        </p>
        {conversations.length === 0 && (
          <p style={{ fontSize: 12, color: '#5A5A66', padding: '4px 10px' }}>
            No conversations yet
          </p>
        )}
        {conversations.map((convo) => {
          const isActive = convo.id === activeConversationId;
          return (
            <button
              key={convo.id}
              onClick={() => { onSelectConversation(convo.id); onClose?.(); }}
              className="group w-full flex items-center gap-1 px-2.5 py-2 rounded-lg text-left transition-all"
              style={{ background: isActive ? 'rgba(123,111,232,0.16)' : 'transparent', marginBottom: 1 }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? 'rgba(123,111,232,0.16)' : 'transparent'; }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: isActive ? '#9D8FFF' : '#F2F1EE',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {convo.title}
              </span>
              <button
                onClick={(e) => handleDeleteConversation(e, convo.id)}
                className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity flex-shrink-0 p-0.5 rounded"
              >
                <X size={12} style={{ color: '#8B8B96' }} />
              </button>
            </button>
          );
        })}
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px' }} />

      {/* ── Bottom: nav + user ── */}
      <div style={{ padding: '10px 8px 16px' }}>
        {/* Business Intelligence — Elite only */}
        {user.tier === 'elite' && (
          <button
            onClick={() => nav('/business-intelligence')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all mb-2"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: '#F2F1EE',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: 12.5,
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          >
            <BarChart3 size={14} style={{ color: '#9D8FFF' }} />
            <span style={{ flex: 1, textAlign: 'left' }}>Business Intelligence</span>
            <span style={{
              fontSize: 8.5, padding: '2px 6px', borderRadius: 999,
              background: 'rgba(123,111,232,0.2)', letterSpacing: '0.08em',
              fontWeight: 600, color: '#9D8FFF',
            }}>ELITE</span>
          </button>
        )}

        {/* Settings + Integrations */}
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => nav('/settings')}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-all"
            style={{ fontSize: 12, color: '#8B8B96' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Settings size={13} />
            Settings
          </button>
          <button
            onClick={() => nav('/integrations')}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-all"
            style={{ fontSize: 12, color: '#8B8B96' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Plug size={13} />
            Integrations
          </button>
        </div>

        {/* User row */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <div
            className="flex items-center justify-center rounded-full text-white font-semibold flex-shrink-0"
            style={{ width: 28, height: 28, fontSize: 11, background: '#7B6FE8' }}
          >
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p style={{ fontSize: 13, fontWeight: 500, color: '#F2F1EE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.firstName} {user.lastName}
            </p>
            <span
              className="inline-block px-1.5 py-0.5 rounded-full mt-0.5"
              style={{ fontSize: 9, fontWeight: 600, background: tierStyle.bg, color: tierStyle.text, letterSpacing: '0.04em' }}
            >
              {user.tier.toUpperCase()}
            </span>
          </div>
          <LogOut size={13} style={{ color: '#5A5A66', flexShrink: 0 }} />
        </button>
      </div>
    </div>
  );

  if (mode === 'desktop') return panel;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 bottom-0 z-50 animate-slide-in-left">
        {panel}
      </div>
    </>
  );
}
