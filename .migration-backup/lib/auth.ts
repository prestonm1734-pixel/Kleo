import { User } from '@/types';

const STORAGE_KEY = 'kleo_user';
const USERS_KEY = 'kleo_users';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function getUsers(): Record<string, User & { password: string }> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, User & { password: string }>): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): { user?: User; error?: string } {
  const users = getUsers();
  if (users[email.toLowerCase()]) {
    return { error: 'An account with this email already exists.' };
  }
  const user: User = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    firstName,
    lastName,
    tier: 'free',
    messageCount: 0,
    messageCountDate: new Date().toDateString(),
  };
  users[email.toLowerCase()] = { ...user, password };
  saveUsers(users);
  setStoredUser(user);
  return { user };
}

export function signIn(
  email: string,
  password: string
): { user?: User; error?: string } {
  const users = getUsers();
  const stored = users[email.toLowerCase()];
  if (!stored) return { error: 'No account found with this email.' };
  if (stored.password !== password) return { error: 'Incorrect password.' };
  const { password: _pw, ...user } = stored;
  setStoredUser(user);
  return { user };
}

export function updateUser(updates: Partial<User>): User | null {
  const user = getStoredUser();
  if (!user) return null;
  const updated = { ...user, ...updates };
  setStoredUser(updated);
  const users = getUsers();
  if (users[user.email]) {
    users[user.email] = { ...users[user.email], ...updates };
    saveUsers(users);
  }
  return updated;
}

export function incrementMessageCount(user: User): User {
  const today = new Date().toDateString();
  const count = user.messageCountDate === today ? user.messageCount + 1 : 1;
  return updateUser({ messageCount: count, messageCountDate: today }) || user;
}

export function getRemainingMessages(user: User): number {
  if (user.tier !== 'free') return Infinity;
  const today = new Date().toDateString();
  const used = user.messageCountDate === today ? user.messageCount : 0;
  return Math.max(0, 10 - used);
}
