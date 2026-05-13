'use client';

import { X, Plus, LogOut, Settings, Plug } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { User, Conversation } from '@/types';
import { AGENTS } from '@/lib/agents';
import { clearStoredUser } from '@/lib/auth';
import { deleteConversation } from '@/lib/conversations';
import KleoLogo from './KleoLogo';

interface SidebarProps {
  mode: 'desktop' | 'mobile-overlay';
  user: User;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onConversationsChange: () => void;
  onClose?: () => void;
}

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  free:  { bg: 'rgba(0,0,0,0.08)',  text: '#888888' },
  pro:   { bg: '#505A98',           text: 'white'   },
  elite: { bg: '#1A1A1A',           text: 'white'   },
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
}: SidebarProps) {
  const router = useRouter();
  const personalAgents = AGENTS.filter((a) => a.team === 'personal');
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
        width: mode === 'desktop' ? 260 : '80vw',
        maxWidth: mode === 'desktop' ? 260 : 300,
        background: '#E8E6E0',
        borderRight: mode === 'desktop' ? '1px solid rgba(0,0,0,0.07)' : 'none',
        flexShrink: 0,
      }}
    >
      {/* ── Top: logo + new chat ── */}
      <div style={{ padding: mode === 'desktop' ? '20px 14px 14px' : '52px 14px 14px' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <KleoLogo size={26} bgColor="#E8E6E0" accentColor="#505A98" interactive />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: '#1A1A1A',
                textTransform: 'uppercase',
              }}
            >
              Kleo
            </span>
          </div>
          {mode === 'mobile-overlay' && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/10 transition-colors"
            >
              <X size={17} style={{ color: '#555' }} />
            </button>
          )}
        </div>

        {/* New conversation */}
        <button
          onClick={() => { onNewConversation(); onClose?.(); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
          style={{
            background: 'rgba(80,90,152,0.09)',
            color: '#505A98',
            fontSize: 13,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(80,90,152,0.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(80,90,152,0.09)')}
        >
          <Plus size={15} />
          New conversation
        </button>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '0 14px' }} />

      {/* ── Finance Team ── */}
      <div style={{ padding: '12px 14px 10px' }}>
        <p
          style={{
            fontSize: 10,
            color: '#888888',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            marginBottom: 8,
          }}
        >
          Finance Team
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {personalAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              title={agent.role}
            >
              <div
                className="flex items-center justify-center rounded-full text-white font-semibold"
                style={{
                  width: 30,
                  height: 30,
                  fontSize: 12,
                  background: agent.avatarColor,
                  opacity: user.tier === 'free' && agent.tier !== 'free' ? 0.32 : 1,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                  flexShrink: 0,
                }}
              >
                {agent.name[0]}
              </div>
              <span style={{ fontSize: 9, color: '#888888', lineHeight: 1.1, textAlign: 'center' }}>
                {agent.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '0 14px' }} />

      {/* ── Recents ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '8px 8px' }}>
        <p
          style={{
            fontSize: 10,
            color: '#888888',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            padding: '4px 8px 6px',
          }}
        >
          Recents
        </p>
        {conversations.length === 0 && (
          <p style={{ fontSize: 12, color: '#AAAAAA', padding: '4px 10px' }}>
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
              style={{
                background: isActive ? 'rgba(80,90,152,0.1)' : 'transparent',
                marginBottom: 1,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isActive ? 'rgba(80,90,152,0.1)' : 'transparent'; }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: isActive ? '#505A98' : '#1A1A1A',
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
                <X size={12} style={{ color: '#888888' }} />
              </button>
            </button>
          );
        })}
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '0 14px' }} />

      {/* ── Bottom: nav + user ── */}
      <div style={{ padding: '10px 8px 16px' }}>
        {/* Settings + Integrations row */}
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => nav('/settings')}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-all"
            style={{ fontSize: 12, color: '#555' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Settings size={13} />
            Settings
          </button>
          <button
            onClick={() => nav('/integrations')}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-all"
            style={{ fontSize: 12, color: '#555' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
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
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-full text-white font-semibold flex-shrink-0"
            style={{ width: 28, height: 28, fontSize: 11, background: '#505A98' }}
          >
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#1A1A1A',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.firstName} {user.lastName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="px-1.5 py-0.5 rounded-full"
                style={{ fontSize: 9, fontWeight: 600, background: tierStyle.bg, color: tierStyle.text, letterSpacing: '0.04em' }}
              >
                {user.tier.toUpperCase()}
              </span>
            </div>
          </div>
          <LogOut size={13} style={{ color: '#AAAAAA', flexShrink: 0 }} />
        </button>
      </div>
    </div>
  );

  if (mode === 'desktop') {
    return panel;
  }

  // Mobile overlay
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 bottom-0 z-50 animate-slide-in-left">
        {panel}
      </div>
    </>
  );
}
