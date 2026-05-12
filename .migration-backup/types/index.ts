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
