import { Conversation, Message } from '@/types';

const KEY = (userId: string) => `kleo_convos_${userId}`;

export function getConversations(userId: string): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY(userId));
    const convos: Conversation[] = raw ? JSON.parse(raw) : [];
    return convos.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

export function saveConversations(userId: string, convos: Conversation[]): void {
  localStorage.setItem(KEY(userId), JSON.stringify(convos));
}

export function getConversation(userId: string, id: string): Conversation | undefined {
  return getConversations(userId).find((c) => c.id === id);
}

export function createConversation(
  userId: string,
  agentId: string,
  firstMessage?: string
): Conversation {
  const convos = getConversations(userId);
  const convo: Conversation = {
    id: crypto.randomUUID(),
    title: firstMessage ? generateTitle(firstMessage) : 'New conversation',
    messages: [],
    agentId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  convos.unshift(convo);
  saveConversations(userId, convos);
  return convo;
}

export function updateConversation(
  userId: string,
  id: string,
  updates: Partial<Conversation>
): void {
  const convos = getConversations(userId);
  const idx = convos.findIndex((c) => c.id === id);
  if (idx >= 0) {
    convos[idx] = { ...convos[idx], ...updates, updatedAt: new Date() };
    saveConversations(userId, convos);
  }
}

export function addMessage(
  userId: string,
  conversationId: string,
  message: Message
): void {
  const convos = getConversations(userId);
  const idx = convos.findIndex((c) => c.id === conversationId);
  if (idx >= 0) {
    convos[idx].messages.push(message);
    convos[idx].updatedAt = new Date();
    if (convos[idx].title === 'New conversation' && message.role === 'user') {
      convos[idx].title = generateTitle(message.content);
    }
    saveConversations(userId, convos);
  }
}

export function deleteConversation(userId: string, id: string): void {
  const convos = getConversations(userId).filter((c) => c.id !== id);
  saveConversations(userId, convos);
}

function generateTitle(text: string): string {
  const stopwords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'i', 'my', 'me', 'we', 'our', 'can', 'do', 'how', 'what', 'should', 'would', 'could', 'help', 'need', 'want', 'have', 'has']);
  const words = text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w.toLowerCase()))
    .slice(0, 4);

  if (words.length === 0) {
    return text.split(/\s+/).slice(0, 4).join(' ');
  }

  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
