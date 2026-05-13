import { supabase, hasSupabase } from './supabase';
import { Conversation, Message } from '../types';

const KEY = (userId: string) => `kleo_convos_${userId}`;

function generateTitle(text: string): string {
  const stops = new Set(['the','a','an','is','are','i','my','me','we','can','do','how','what','should','help','need','want','have']);
  const words = text.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/)
    .filter((w) => w.length > 2 && !stops.has(w.toLowerCase())).slice(0, 5);
  return (words.length ? words : text.split(/\s+/).slice(0, 4))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ── localStorage ────────────────────────────────────────────────────────────

function localGet(userId: string): Conversation[] {
  try {
    const raw = localStorage.getItem(KEY(userId));
    const list: Conversation[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch { return []; }
}

function localSave(userId: string, convos: Conversation[]) {
  localStorage.setItem(KEY(userId), JSON.stringify(convos));
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function getConversations(userId: string): Promise<Conversation[]> {
  if (hasSupabase && supabase) {
    const { data } = await supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (data) {
      return data.map((row) => ({
        id: row.id,
        title: row.title,
        messages: (row.messages || []).map((m: Record<string, string>) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.created_at,
        })).sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }
  }
  return localGet(userId);
}

export async function createConversation(userId: string, firstMessage?: string): Promise<Conversation> {
  const title = firstMessage ? generateTitle(firstMessage) : 'New conversation';
  const now = new Date().toISOString();

  if (hasSupabase && supabase) {
    const { data } = await supabase
      .from('conversations')
      .insert({ user_id: userId, title, created_at: now, updated_at: now })
      .select()
      .single();
    if (data) {
      return { id: data.id, title, messages: [], createdAt: data.created_at, updatedAt: data.updated_at };
    }
  }

  const convo: Conversation = { id: crypto.randomUUID(), title, messages: [], createdAt: now, updatedAt: now };
  const list = localGet(userId);
  list.unshift(convo);
  localSave(userId, list);
  return convo;
}

export async function addMessage(userId: string, conversationId: string, message: Message): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.from('messages').insert({
      id: message.id,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      created_at: message.createdAt,
    });
    await supabase.from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    return;
  }

  const list = localGet(userId);
  const idx = list.findIndex((c) => c.id === conversationId);
  if (idx >= 0) {
    list[idx].messages.push(message);
    list[idx].updatedAt = new Date().toISOString();
    if (list[idx].title === 'New conversation' && message.role === 'user') {
      list[idx].title = generateTitle(message.content);
    }
    localSave(userId, list);
  }
}

export async function updateConversationTitle(userId: string, conversationId: string, title: string): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.from('conversations').update({ title }).eq('id', conversationId);
    return;
  }
  const list = localGet(userId);
  const idx = list.findIndex((c) => c.id === conversationId);
  if (idx >= 0) { list[idx].title = title; localSave(userId, list); }
}

export async function deleteConversation(userId: string, conversationId: string): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.from('conversations').delete().eq('id', conversationId);
    return;
  }
  const list = localGet(userId).filter((c) => c.id !== conversationId);
  localSave(userId, list);
}
