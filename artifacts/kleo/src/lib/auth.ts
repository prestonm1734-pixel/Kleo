import { supabase, hasSupabase } from './supabase';
import { User } from '../types';

const STORAGE_KEY = 'kleo_user';
const USERS_KEY = 'kleo_users';

// ── localStorage helpers ────────────────────────────────────────────────────

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setStoredUser(user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}

function getLocalUsers(): Record<string, User & { password: string }> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLocalUsers(users: Record<string, User & { password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  if (hasSupabase && supabase) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const meta = data.user.user_metadata || {};
    return {
      id: data.user.id,
      email: data.user.email ?? '',
      firstName: meta.first_name ?? meta.full_name?.split(' ')[0] ?? '',
      lastName: meta.last_name ?? meta.full_name?.split(' ').slice(1).join(' ') ?? '',
    };
  }
  return getStoredUser();
}

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ user?: User; error?: string }> {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Sign up failed.' };
    const user: User = {
      id: data.user.id,
      email: data.user.email ?? email,
      firstName,
      lastName,
    };
    return { user };
  }

  // localStorage fallback
  const users = getLocalUsers();
  if (users[email.toLowerCase()]) return { error: 'An account with this email already exists.' };
  const user: User = { id: crypto.randomUUID(), email: email.toLowerCase(), firstName, lastName };
  users[email.toLowerCase()] = { ...user, password };
  saveLocalUsers(users);
  setStoredUser(user);
  return { user };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user?: User; error?: string }> {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Sign in failed.' };
    const meta = data.user.user_metadata || {};
    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
        firstName: meta.first_name ?? '',
        lastName: meta.last_name ?? '',
      },
    };
  }

  // localStorage fallback
  const users = getLocalUsers();
  const stored = users[email.toLowerCase()];
  if (!stored) return { error: 'No account found with this email.' };
  if (stored.password !== password) return { error: 'Incorrect password.' };
  const { password: _pw, ...user } = stored;
  setStoredUser(user);
  return { user };
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  if (hasSupabase && supabase) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) return { error: error.message };
    return {};
  }
  return { error: 'Google sign-in requires Supabase. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' };
}

export async function signOut(): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.auth.signOut();
  }
  clearStoredUser();
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  if (hasSupabase && supabase) {
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) { callback(null); return; }
      const meta = session.user.user_metadata || {};
      callback({
        id: session.user.id,
        email: session.user.email ?? '',
        firstName: meta.first_name ?? meta.full_name?.split(' ')[0] ?? '',
        lastName: meta.last_name ?? meta.full_name?.split(' ').slice(1).join(' ') ?? '',
      });
    });
    return () => data.subscription.unsubscribe();
  }
  return () => {};
}
