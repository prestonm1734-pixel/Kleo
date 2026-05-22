import { LucaFinding, LucaSession, LucaStep, LucaStepType } from '@/types';

/* ─────────────────────────────────────────────
   Luca — autonomous background agent
   Separate identity from the chat specialists.
   The "always-on" runner that visibly works.
───────────────────────────────────────────── */

export const LUCA = {
  id: 'luca',
  name: 'Luca',
  role: 'Autonomous Financial Agent',
  tagline: 'Watching your money 24/7. Finding what you would have missed.',
  accent: '#7B6FE8',
  systemPrompt:
    'You are Luca, Kleo\'s autonomous financial agent. You run continuously across the user\'s accounts looking for fee anomalies, cancellable subscriptions, tax deductions, savings arbitrage, and refinance opportunities. You report findings tersely and with exact dollar amounts.',
} as const;

/* ── Scripted timeline (mock; structure is real) ──────────── */

export interface ScriptedStep {
  type: LucaStepType;
  message: string;
  delayMs: number;          // delay AFTER this step before the next
  finding?: Omit<LucaFinding, 'id'>;
}

// TODO: replace with live integration data
export const LUCA_SCRIPT: ScriptedStep[] = [
  { type: 'connecting', message: 'Connecting to your accounts...',                            delayMs: 350 },
  { type: 'reading',    message: 'Reading 847 transactions from last 90 days...',             delayMs: 500 },
  { type: 'analyzing',  message: 'Scanning for fee anomalies...',                             delayMs: 320 },
  {
    type: 'found',
    message: 'Found: $35 overdraft fee — Chase — May 18',
    delayMs: 280,
    finding: {
      kind: 'fee_dispute',
      title: '$35 overdraft fee — Chase',
      detail: 'May 18. First overdraft in 12 months. Chase forgives one per year as a courtesy on request.',
      amount: 35,
      source: 'Chase ··· 4521',
      action: { label: 'Generate dispute script' },
      evidence: 'CFPB guidance: banks typically grant a one-time waiver when requested by phone within 60 days.',
    },
  },
  { type: 'analyzing',  message: 'Researching CFPB dispute guidelines for overdraft fees...', delayMs: 380 },
  { type: 'analyzing',  message: 'Generating dispute script...',                              delayMs: 280 },
  { type: 'analyzing',  message: 'Analyzing recurring subscriptions...',                      delayMs: 360 },
  { type: 'analyzing',  message: 'Cross-referencing usage patterns...',                       delayMs: 300 },
  {
    type: 'found',
    message: 'Found: Peacock — 94 days inactive — $15.99/month',
    delayMs: 320,
    finding: {
      kind: 'cancel_subscription',
      title: 'Peacock subscription unused 94 days',
      detail: 'Last login March 18. $15.99/mo · $191.88/yr if cancelled today.',
      amount: 191.88,
      source: 'Apple Pay · peacocktv.com',
      action: { label: 'Open cancellation page', href: 'https://www.peacocktv.com/account' },
      evidence: 'No streaming activity detected on connected devices in 94 days.',
    },
  },
  { type: 'analyzing',  message: 'Locating cancellation URL...',                              delayMs: 260 },
  { type: 'analyzing',  message: 'Scanning tax deduction opportunities...',                   delayMs: 400 },
  {
    type: 'found',
    message: 'Matched: Best Buy $127 — home office equipment',
    delayMs: 300,
    finding: {
      kind: 'tax_match',
      title: 'Best Buy $127 → home office deduction',
      detail: 'Standing desk purchased April 3. Qualifies as Schedule C office expense for your 1099 income.',
      amount: 38,  // est tax savings at 30%
      source: 'Chase Sapphire · Apr 3',
      action: { label: 'Add to deduction tracker' },
      evidence: 'IRS Pub 587: equipment used exclusively for self-employment qualifies in full.',
    },
  },
  { type: 'analyzing',  message: 'Checking savings rate arbitrage...',                        delayMs: 420 },
  { type: 'analyzing',  message: 'Comparing yields across connected high-yield accounts...',  delayMs: 360 },
  {
    type: 'found',
    message: 'Found: $840/year opportunity — Chase vs Marcus Goldman',
    delayMs: 300,
    finding: {
      kind: 'savings_arbitrage',
      title: 'Move $24K idle cash to Marcus',
      detail: 'Your Chase savings yields 0.01%. Marcus Goldman yields 4.5%. $840/yr at current balance.',
      amount: 840,
      source: 'Chase Savings ··· 4521',
      action: { label: 'Start transfer' },
      evidence: 'Marcus by Goldman Sachs, FDIC insured, no minimum, instant ACH from Chase.',
    },
  },
  { type: 'complete', message: 'Agent complete — 4 actions ready for your review',            delayMs: 0 },
];

/* ── Session storage (localStorage; same pattern as conversations.ts) ── */

function key(userId: string) {
  return `kleo_luca_sessions_${userId}`;
}

export function getSessions(userId: string): LucaSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LucaSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSession(userId: string, session: LucaSession): void {
  if (typeof window === 'undefined') return;
  const all = getSessions(userId);
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) all[idx] = session;
  else all.unshift(session);
  // cap to last 50 sessions
  localStorage.setItem(key(userId), JSON.stringify(all.slice(0, 50)));
}

export function getLatestSession(userId: string): LucaSession | undefined {
  const sessions = getSessions(userId);
  return sessions[0];
}

export function lifetimeSavings(userId: string): number {
  return getSessions(userId).reduce((sum, s) => sum + s.totalValue, 0);
}

export function newSessionId(): string {
  return (
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `luca_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  );
}

/* ── Step / event helpers ─────────────────────────────────── */

export function stepColor(type: LucaStepType): string {
  switch (type) {
    case 'found':     return '#9D8FFF';   // brand purple, brighter for dark
    case 'complete':  return '#6FCF97';   // green
    case 'error':     return '#FF6B6B';
    case 'connecting':
    case 'reading':
    case 'analyzing':
    default:          return '#F2F1EE';
  }
}

export function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function formatMoney(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${n.toFixed(n < 10 ? 2 : 0)}`;
}
