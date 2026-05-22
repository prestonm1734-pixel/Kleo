'use client';

import { ChevronDown } from 'lucide-react';
import { getAgentById } from '@/lib/agents';

interface AgentSelectorProps {
  agentId: string;
  onOpen: () => void;
}

export default function AgentSelector({ agentId, onOpen }: AgentSelectorProps) {
  const agent = getAgentById(agentId);
  if (!agent) return null;

  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:bg-white/5"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: agent.avatarColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 15, fontWeight: 500, color: '#F2F1EE' }}>
        {agent.name}
      </span>
      <span style={{ fontSize: 15, color: '#8B8B96' }}>·</span>
      <span style={{ fontSize: 15, color: '#8B8B96' }}>{agent.role}</span>
      <ChevronDown size={15} style={{ color: '#8B8B96', marginLeft: 2 }} />
    </button>
  );
}
