'use client';

import { X, Lock } from 'lucide-react';
import { AGENTS } from '@/lib/agents';
import { Agent, User } from '@/types';

interface FinanceTeamSheetProps {
  currentAgentId: string;
  userTier: User['tier'];
  onSelectAgent: (agentId: string) => void;
  onClose: () => void;
}

const TEAM_LABELS: Record<string, string> = {
  personal: 'PERSONAL FINANCE TEAM',
  business: 'BUSINESS TEAM · Elite',
  markets: 'MARKETS TEAM · Elite',
};

function AgentCard({
  agent,
  isActive,
  isLocked,
  onSelect,
}: {
  agent: Agent;
  isActive: boolean;
  isLocked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={isLocked ? undefined : onSelect}
      className="w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all"
      style={{
        border: isActive ? '1.5px solid #505A98' : '1.5px solid transparent',
        opacity: isLocked ? 0.6 : 1,
        cursor: isLocked ? 'default' : 'pointer',
        background: isActive ? 'rgba(80,90,152,0.05)' : 'transparent',
      }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full text-white font-semibold"
        style={{
          width: 42,
          height: 42,
          background: agent.avatarColor,
          fontSize: 16,
        }}
      >
        {agent.name[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>
            {agent.name}
          </span>
          {isLocked && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'rgba(0,0,0,0.08)', color: '#888888' }}>
              <Lock size={10} />
              <span>{agent.tier === 'elite' ? 'Elite' : 'Pro'}</span>
            </div>
          )}
        </div>
        <p style={{ fontSize: 13, color: '#888888', marginTop: 1 }}>{agent.role}</p>
        <p
          style={{
            fontSize: 12,
            color: '#888888',
            marginTop: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {agent.specialty}
        </p>
      </div>
    </button>
  );
}

export default function FinanceTeamSheet({
  currentAgentId,
  userTier,
  onSelectAgent,
  onClose,
}: FinanceTeamSheetProps) {
  const teams: Array<'personal' | 'business' | 'markets'> = ['personal', 'business', 'markets'];

  function isLocked(agent: Agent): boolean {
    if (userTier === 'elite') return false;
    if (userTier === 'pro') return agent.tier === 'elite';
    return agent.tier !== 'free';
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
        style={{
          background: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.15)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A' }}>Finance Team</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 transition-colors"
          >
            <X size={18} style={{ color: '#888888' }} />
          </button>
        </div>

        {/* Agent list */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {teams.map((team) => {
            const teamAgents = AGENTS.filter((a) => a.team === team);
            return (
              <div key={team} className="mb-4">
                <p
                  className="mb-2 px-1"
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: '#888888',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {TEAM_LABELS[team]}
                </p>
                <div className="flex flex-col gap-1">
                  {teamAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isActive={agent.id === currentAgentId}
                      isLocked={isLocked(agent)}
                      onSelect={() => {
                        onSelectAgent(agent.id);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
