export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  tier: 'free' | 'pro' | 'elite';
  messageCount: number;
  messageCountDate: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentId?: string;
  timestamp: Date;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatarColor: string;
  systemPrompt: string;
  tier: 'free' | 'pro' | 'elite';
  team: 'personal' | 'business' | 'markets';
}

/* ── Luca: autonomous background agent ─────────────────────── */

export type LucaStepType =
  | 'connecting'
  | 'reading'
  | 'analyzing'
  | 'found'
  | 'complete'
  | 'error';

export interface LucaStep {
  id: string;
  type: LucaStepType;
  message: string;
  timestamp: number;
  findingId?: string;
}

export type LucaFindingKind =
  | 'fee_dispute'
  | 'cancel_subscription'
  | 'tax_match'
  | 'savings_arbitrage'
  | 'refinance'
  | 'duplicate_charge';

export interface LucaFinding {
  id: string;
  kind: LucaFindingKind;
  title: string;
  detail: string;
  amount: number;      // dollars saved / recovered (annualized for recurring)
  source: string;      // e.g. "Chase ··· 4521"
  action: {
    label: string;     // primary CTA, e.g. "Generate dispute letter"
    href?: string;     // optional external URL
  };
  evidence?: string;   // short string for the modal
}

export interface LucaSession {
  id: string;
  userId: string;
  startedAt: number;
  completedAt?: number;
  steps: LucaStep[];
  findings: LucaFinding[];
  status: 'running' | 'complete' | 'error';
  totalValue: number;  // sum of finding amounts
}
