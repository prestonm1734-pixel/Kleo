export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface FinancialData {
  netWorth: number;
  netWorthChangePct: number;
  cashOnHand: number;
  accountCount: number;
  burnRate: number;
  burnRateChangePct: number;
  sparkData: number[];
  isPlaid: boolean;
}
