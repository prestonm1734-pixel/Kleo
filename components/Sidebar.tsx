'use client';

import { X, Plus, LogOut, Settings, Plug, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { User, Conversation } from '@/types';
import { AGENTS } from '@/lib/agents';
import { clearStoredUser } from '@/lib/auth';
import { deleteConversation } from '@/lib/conversations';

interface SidebarProps {
  user: User;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onSelectAgent: (agentId: string) => void;
  onClose: () => void;
  onConversationsChange: () => void;
}

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  elite: 'Elite',
};

export default function Sidebar({
  user,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onClose,
  onConversationsChange,
}: SidebarProps) {
  const router = useRouter();

  const personalAgents = AGENTS.filter((a) => a.team === 'personal');

  function handleSignOut() {
    clearStoredUser();
    router.push('/login');
  }

  function handleDeleteConversation(e: React.MouseEvent, convoId: string) {
    e.stopPropagation();
    deleteConversation(user.id, convoId);
    onConversationsChange();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <div
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col animate-slide-in-left"
        style={{
          width: '80vw',
          maxWidth: 320,
          background: '#E8E6E0',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4">
          <span
            style={{
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: '0.15em',
              color: '#1A1A1A',
              textTransform: 'uppercase',
            }}
          >
            KLEO
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/10 transition-colors"
          >
            <X size={18} style={{ color: '#1A1A1A' }} />
          </button>
        </div>

        {/* Finance Team Row */}
        <div className="px-5 mb-4">
          <p
            style={{
              fontSize: 11,
              color: '#888888',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 8,
            }}
          >
            Your Finance Team
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {personalAgents.map((agent) => (
              <div key={agent.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className="flex items-center justify-center rounded-full text-white text-sm font-semibold"
                  style={{
                    width: 36,
                    height: 36,
                    background: agent.avatarColor,
                    opacity: user.tier === 'free' && agent.tier !== 'free' ? 0.4 : 1,
                  }}
                >
                  {agent.name[0]}
                </div>
                <span style={{ fontSize: 9, color: '#888888', textAlign: 'center' }}>
                  {agent.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-5 mb-3" style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />

        {/* Nav items */}
        <div className="px-3 mb-2 flex flex-col gap-1">
          <button
            onClick={() => { router.push('/integrations'); onClose(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors text-left"
          >
            <Plug size={18} style={{ color: '#888888' }} />
            <span style={{ fontSize: 15, color: '#1A1A1A' }}>Integrations</span>
          </button>
          <button
            onClick={() => { router.push('/settings'); onClose(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors text-left"
          >
            <Settings size={18} style={{ color: '#888888' }} />
            <span style={{ fontSize: 15, color: '#1A1A1A' }}>Settings</span>
          </button>
          <button
            onClick={() => { router.push('/settings#subscription'); onClose(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors text-left"
          >
            <CreditCard size={18} style={{ color: '#888888' }} />
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 15, color: '#1A1A1A' }}>Subscription</span>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: user.tier === 'free' ? 'rgba(0,0,0,0.1)' : '#505A98',
                  color: user.tier === 'free' ? '#888888' : 'white',
                }}
              >
                {TIER_LABELS[user.tier]}
              </span>
            </div>
          </button>
        </div>

        <div className="mx-5 mb-3" style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />

        {/* New conversation */}
        <button
          onClick={() => { onNewConversation(); onClose(); }}
          className="mx-3 flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors text-left mb-2"
        >
          <Plus size={18} style={{ color: '#505A98' }} />
          <span style={{ fontSize: 15, color: '#505A98', fontWeight: 500 }}>New conversation</span>
        </button>

        {/* Recents */}
        <div className="flex-1 overflow-y-auto px-3">
          <p
            style={{
              fontSize: 10,
              color: '#888888',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingLeft: 12,
              marginBottom: 4,
            }}
          >
            Recents
          </p>
          <div className="flex flex-col gap-0.5">
            {conversations.length === 0 && (
              <p style={{ fontSize: 13, color: '#888888', padding: '8px 12px' }}>
                No conversations yet
              </p>
            )}
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => { onSelectConversation(convo.id); onClose(); }}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors text-left"
                style={{
                  background:
                    activeConversationId === convo.id
                      ? 'rgba(80,90,152,0.08)'
                      : 'transparent',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: activeConversationId === convo.id ? '#505A98' : '#1A1A1A',
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
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ml-2 flex-shrink-0"
                >
                  <X size={14} style={{ color: '#888888' }} />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="px-3 pb-8 pt-3">
          <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', marginBottom: 8 }} />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors text-left w-full"
          >
            <LogOut size={18} style={{ color: '#888888' }} />
            <span style={{ fontSize: 15, color: '#888888' }}>Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
}
