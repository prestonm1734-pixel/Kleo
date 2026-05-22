'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, Lock, Sparkles, AlertTriangle,
  TrendingUp, Wallet, LineChart, Send, Zap, BarChart3, Calendar,
} from 'lucide-react';
import { getStoredUser } from '@/lib/auth';
import { User } from '@/types';

/* ─────────────────────────────────────────────
   Mock telemetry — in production these would
   stream from QuickBooks / Stripe / Plaid via
   the integrations layer and be projected by
   the Marcus CFO agent.
───────────────────────────────────────────── */

type KPI = {
  id: string;
  label: string;
  value: string;
  raw: number;
  delta: number;           // percent change vs prior period
  series: number[];        // sparkline
  positiveIsGood: boolean;
  unit?: string;
  icon: React.ReactNode;
};

const baseKPIs: KPI[] = [
  { id: 'mrr',     label: 'MRR',                value: '$184,250', raw: 184250, delta: 6.4,  series: [142,148,151,159,163,170,175,178,184], positiveIsGood: true,  icon: <TrendingUp size={14} /> },
  { id: 'cash',    label: 'Cash on hand',       value: '$1.42M',   raw: 1420000, delta: -2.1, series: [1.51,1.49,1.48,1.47,1.46,1.45,1.44,1.43,1.42], positiveIsGood: true,  icon: <Wallet size={14} /> },
  { id: 'runway',  label: 'Runway',             value: '14.8 mo',  raw: 14.8,   delta: -0.6, series: [16,15.8,15.5,15.3,15.1,15,14.9,14.8,14.8], positiveIsGood: true,  icon: <Calendar size={14} /> },
  { id: 'burn',    label: 'Net burn',           value: '$96,400',  raw: 96400,  delta: 4.2,  series: [78,82,85,88,90,92,93,95,96], positiveIsGood: false, icon: <Zap size={14} /> },
  { id: 'gross',   label: 'Gross margin',       value: '71.3%',    raw: 71.3,   delta: 1.8,  series: [67,68,68.5,69,69.5,70,70.6,71,71.3], positiveIsGood: true,  icon: <BarChart3 size={14} /> },
  { id: 'invest',  label: 'Investment income',  value: '$8,920',   raw: 8920,   delta: 12.4, series: [6.1,6.4,6.8,7.0,7.4,7.9,8.2,8.6,8.9], positiveIsGood: true,  icon: <LineChart size={14} /> },
];

const incomeStreams = [
  { name: 'Recurring revenue (SaaS)', amount: 184250, color: '#7B6FE8', portion: 0 },
  { name: 'Services / consulting',    amount: 42100,  color: '#6FCF97', portion: 0 },
  { name: 'Investment dividends',     amount: 8920,   color: '#16A085', portion: 0 },
  { name: 'Rental income',            amount: 5400,   color: '#8B5E3C', portion: 0 },
  { name: 'Capital gains (realized)', amount: 3120,   color: '#9B59B6', portion: 0 },
];

const anomalies = [
  { id: 1, sev: 'high',  title: 'AWS bill up 38% MoM',         note: 'Compute spend spiked Apr 14–21. Likely the new staging cluster — review or auto-scale down.' },
  { id: 2, sev: 'med',   title: '3 customers downgraded',      note: 'Combined $4.2k MRR impact. All cited "team size reduction." Worth a retention call this week.' },
  { id: 3, sev: 'low',   title: 'Quarterly tax under-reserve', note: 'Cash reserve is $11k short of estimated Q2 federal liability. Move from operating to tax holding.' },
  { id: 4, sev: 'med',   title: 'Late receivables: $28,400',   note: 'Two invoices over 45 days past due. Auto-dunning is paused — re-enable?' },
];

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */

export default function BusinessIntelligencePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hireAdds, setHireAdds] = useState(0);          // simulator: new hires @ ~$11k/mo loaded
  const [priceLift, setPriceLift] = useState(0);        // simulator: % price increase
  const [tab, setTab] = useState<'pulse'|'forecast'|'streams'|'tax'>('pulse');
  const [liveOn, setLiveOn] = useState(true);
  const [briefingTick, setBriefingTick] = useState(0);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
  }, [router]);

  // gently animate the briefing pulse so it feels live
  useEffect(() => {
    if (!liveOn) return;
    const t = setInterval(() => setBriefingTick(n => n + 1), 4500);
    return () => clearInterval(t);
  }, [liveOn]);

  const totalIncome = useMemo(
    () => incomeStreams.reduce((s, x) => s + x.amount, 0),
    [],
  );
  const streams = useMemo(
    () => incomeStreams.map(s => ({ ...s, portion: s.amount / totalIncome })),
    [totalIncome],
  );

  // Simulator math — additive monthly burn from hires, MRR lift from pricing
  const simBurnDelta  = hireAdds * 11000;
  const simRevDelta   = Math.round(184250 * (priceLift / 100));
  const simRunwayBase = 14.8;
  const simRunway = Math.max(
    1,
    Math.round((simRunwayBase + (simRevDelta - simBurnDelta) / 96400) * 10) / 10,
  );

  if (!user) return null;
  const locked = user.tier !== 'elite';

  /* ── Locked state ─────────────────────────── */
  if (locked) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0B0F', padding: '32px 20px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-8 text-sm"
            style={{ color: '#8B8B96' }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ background: '#15151B', borderRadius: 24, padding: 40, color: '#F2F1EE', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-4" style={{ opacity: 0.75 }}>
              <Lock size={14} /> <span style={{ fontSize: 11, letterSpacing: '0.16em' }}>ELITE</span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.1, marginBottom: 14 }}>
              Business Intelligence
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.55, opacity: 0.78, marginBottom: 28, maxWidth: 540 }}>
              A live CFO room for people with business income, investment income, or
              complex finances. Streams every dollar in and out, forecasts 13 weeks of
              cash, flags anomalies before they bite, and lets you simulate hires,
              raises, and pricing changes in real time.
            </p>
            <button
              onClick={() => router.push('/settings')}
              style={{
                background: '#15151B', color: '#F2F1EE',
                borderRadius: 999, padding: '12px 22px',
                fontSize: 14, fontWeight: 600,
              }}
            >
              Upgrade to Elite
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Elite experience ────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0F' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#0B0B0F', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} style={{ color: '#8B8B96' }} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.16em', color: '#8B8B96' }}>
              ELITE · BUSINESS INTELLIGENCE
            </p>
            <h1 style={{ fontSize: 17, fontWeight: 600, color: '#F2F1EE' }}>
              {user.firstName}'s CFO Room
            </h1>
          </div>
        </div>
        <button
          onClick={() => setLiveOn(v => !v)}
          className="flex items-center gap-2"
          style={{
            fontSize: 11, color: liveOn ? '#6FCF97' : '#8B8B96',
            background: liveOn ? 'rgba(111,207,151,0.12)' : 'rgba(255,255,255,0.05)',
            padding: '6px 12px', borderRadius: 999, fontWeight: 600,
            letterSpacing: '0.08em',
          }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: 999,
            background: liveOn ? '#6FCF97' : '#8B8B96',
            boxShadow: liveOn ? '0 0 0 4px rgba(111,207,151,0.18)' : 'none',
          }} />
          {liveOn ? 'LIVE' : 'PAUSED'}
        </button>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 20px 64px' }}>

        {/* ── AI Executive Briefing ────────── */}
        <BriefingCard tick={briefingTick} firstName={user.firstName} />

        {/* ── KPI grid ─────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12, marginTop: 24,
        }}>
          {baseKPIs.map(k => <KpiCard key={k.id} k={k} />)}
        </div>

        {/* ── Tabs ─────────────────────────── */}
        <div style={{
          display: 'flex', gap: 6, marginTop: 28, marginBottom: 16,
          borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 0,
        }}>
          {(['pulse','forecast','streams','tax'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                color: tab === t ? '#F2F1EE' : '#888',
                fontWeight: tab === t ? 600 : 500,
                borderBottom: `2px solid ${tab === t ? '#F2F1EE' : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              {t === 'pulse'    && 'Anomaly Radar'}
              {t === 'forecast' && '13-Week Forecast'}
              {t === 'streams'  && 'Income Streams'}
              {t === 'tax'      && 'Tax Liability'}
            </button>
          ))}
        </div>

        {tab === 'pulse'    && <AnomalyRadar />}
        {tab === 'forecast' && <Forecast hireAdds={hireAdds} priceLift={priceLift} />}
        {tab === 'streams'  && <Streams streams={streams} total={totalIncome} />}
        {tab === 'tax'      && <TaxLiability />}

        {/* ── What-If Simulator ───────────── */}
        <div style={{
          background: '#15151B', borderRadius: 20, padding: 22, marginTop: 24,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2" style={{ color: '#8B8B96', fontSize: 11, letterSpacing: '0.14em' }}>
                <Sparkles size={12} /> WHAT IF SIMULATOR
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
                Move the levers. See the future.
              </h2>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #7B6FE8 0%, #5C4FD8 100%)', color: 'white', borderRadius: 12,
              padding: '10px 14px', minWidth: 180,
            }}>
              <p style={{ fontSize: 10, opacity: 0.6, letterSpacing: '0.14em' }}>NEW RUNWAY</p>
              <p style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>{simRunway} mo</p>
              <p style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                Net Δ {simRevDelta - simBurnDelta >= 0 ? '+' : ''}
                ${(simRevDelta - simBurnDelta).toLocaleString()} / mo
              </p>
            </div>
          </div>

          <Slider
            label={`Add ${hireAdds} engineer${hireAdds === 1 ? '' : 's'}`}
            sub={`+$${(simBurnDelta).toLocaleString()} loaded monthly cost`}
            min={0} max={8} value={hireAdds} onChange={setHireAdds}
          />
          <Slider
            label={`Raise prices by ${priceLift}%`}
            sub={`+$${simRevDelta.toLocaleString()} MRR · assumes ${priceLift > 12 ? 'modest churn risk' : 'no churn'}`}
            min={0} max={25} value={priceLift} onChange={setPriceLift}
          />
        </div>

        {/* ── Ask Marcus ──────────────────── */}
        <AskMarcus />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

function BriefingCard({ tick, firstName }: { tick: number; firstName: string }) {
  const briefings = [
    `MRR crossed $184k this week — up 6.4% MoM, driven by 11 net-new seats on the Pro plan. At this pace you cross $200k MRR by mid-July.`,
    `Cash dipped to $1.42M after the Q2 estimated tax payment cleared. Burn ticked up 4.2% on the AWS spike — worth a look before it compounds.`,
    `Your investment income is up 12.4% — the bond ladder you set up in March is now throwing off ~$8.9k/mo. Reinvesting yields about $290/yr in additional dividends.`,
    `Three customers downgraded this week ($4.2k MRR impact) — all cited team size. Worth a 15-minute retention call; historically you save 60% of these.`,
  ];
  const current = briefings[tick % briefings.length];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #15151B 0%, #1C1C24 100%)',
      color: '#F2F1EE', borderRadius: 20,
      padding: 22, position: 'relative', overflow: 'hidden',
      border: '1px solid rgba(123,111,232,0.18)',
    }}>
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 220, height: 220,
        background: 'radial-gradient(circle, rgba(123,111,232,0.35) 0%, transparent 70%)',
      }} />
      <div className="flex items-center gap-2" style={{ opacity: 0.7, fontSize: 11, letterSpacing: '0.14em' }}>
        <Sparkles size={12} /> MARCUS · CFO BRIEFING
      </div>
      <p style={{
        fontSize: 18, lineHeight: 1.5, fontWeight: 500, marginTop: 10,
        maxWidth: 760,
      }}>
        Morning {firstName}. {current}
      </p>
      <div className="flex gap-2 mt-4" style={{ position: 'relative' }}>
        <button style={pillBtn('white','#F2F1EE')}>Pull this into a deck</button>
        <button style={pillBtn('rgba(255,255,255,0.12)','white')}>Open in chat</button>
      </div>
    </div>
  );
}

function KpiCard({ k }: { k: KPI }) {
  const positive = k.delta >= 0;
  const good = positive === k.positiveIsGood;
  const color = good ? '#6FCF97' : '#FF6B6B';
  return (
    <div style={{
      background: '#15151B', borderRadius: 16, padding: 14,
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="flex items-center justify-between" style={{ color: '#8B8B96' }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: 11, letterSpacing: '0.08em' }}>
          {k.icon}{k.label.toUpperCase()}
        </div>
        <div className="flex items-center gap-0.5" style={{ fontSize: 11, color, fontWeight: 600 }}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(k.delta).toFixed(1)}%
        </div>
      </div>
      <p style={{ fontSize: 22, fontWeight: 600, color: '#F2F1EE', marginTop: 6 }}>{k.value}</p>
      <Spark series={k.series} color={color} />
    </div>
  );
}

function Spark({ series, color }: { series: number[]; color: string }) {
  const w = 180, h = 28;
  const min = Math.min(...series), max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * w;
    const y = h - ((v - min) / span) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 28, marginTop: 6 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnomalyRadar() {
  const sevColor = (s: string) => s === 'high' ? '#FF6B6B' : s === 'med' ? '#F2C94C' : '#8B8B96';
  return (
    <div style={{ background: '#15151B', borderRadius: 20, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
      {anomalies.map((a, i) => (
        <div key={a.id} style={{
          padding: '16px 18px',
          borderBottom: i < anomalies.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: `${sevColor(a.sev)}22`, color: sevColor(a.sev),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={15} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2">
              <p style={{ fontWeight: 600, color: '#F2F1EE', fontSize: 14 }}>{a.title}</p>
              <span style={{
                fontSize: 9, letterSpacing: '0.12em', padding: '2px 8px', borderRadius: 999,
                background: `${sevColor(a.sev)}1A`, color: sevColor(a.sev), fontWeight: 600,
              }}>{a.sev.toUpperCase()}</span>
            </div>
            <p style={{ color: '#8B8B96', fontSize: 13, marginTop: 4, lineHeight: 1.45 }}>{a.note}</p>
          </div>
          <button style={pillBtn('rgba(255,255,255,0.05)','#F2F1EE')}>Investigate</button>
        </div>
      ))}
    </div>
  );
}

function Forecast({ hireAdds, priceLift }: { hireAdds: number; priceLift: number }) {
  // Weekly cash projection — base, optimistic (price lift), pessimistic (hires)
  const weeks = 13;
  const start = 1.42; // $M
  const baseChange = -0.018; // ~$25k/wk net burn baseline
  const lift = (priceLift * 184250 * 0.23) / 1_000_000;     // weekly lift in $M
  const drag = (hireAdds * 11000 * 0.23) / 1_000_000;       // weekly drag in $M

  const series = Array.from({ length: weeks }, (_, i) => {
    const t = i + 1;
    return {
      base: +(start + baseChange * t).toFixed(3),
      opt:  +(start + (baseChange + lift) * t).toFixed(3),
      pess: +(start + (baseChange - drag) * t).toFixed(3),
    };
  });

  const all = series.flatMap(s => [s.base, s.opt, s.pess]);
  const min = Math.min(...all, 0.5);
  const max = Math.max(...all, start + 0.2);
  const W = 880, H = 220;
  const toX = (i: number) => 30 + (i / (weeks - 1)) * (W - 50);
  const toY = (v: number) => 10 + (1 - (v - min) / (max - min)) * (H - 30);

  const line = (key: 'base'|'opt'|'pess') =>
    series.map((s, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(s[key])}`).join(' ');

  return (
    <div style={{ background: '#15151B', borderRadius: 20, padding: 22, border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p style={{ fontSize: 11, color: '#8B8B96', letterSpacing: '0.14em' }}>13-WEEK CASH FORECAST</p>
          <h3 style={{ fontSize: 17, fontWeight: 600 }}>Projection ($ millions)</h3>
        </div>
        <div className="flex gap-3" style={{ fontSize: 11, color: '#8B8B96' }}>
          <Legend color="#6FCF97" label="Optimistic" />
          <Legend color="#7B6FE8" label="Base" />
          <Legend color="#FF6B6B" label="With new hires" />
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 240 }}>
        {[0,1,2,3].map(i => {
          const y = 10 + (i / 3) * (H - 30);
          return <line key={i} x1={30} x2={W-20} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />;
        })}
        <path d={line('opt')}  fill="none" stroke="#6FCF97" strokeWidth={2.2} />
        <path d={line('base')} fill="none" stroke="#7B6FE8" strokeWidth={2.2} strokeDasharray="4 4" />
        <path d={line('pess')} fill="none" stroke="#FF6B6B" strokeWidth={2.2} />
      </svg>
      <p style={{ fontSize: 12, color: '#8B8B96', marginTop: 10, lineHeight: 1.5 }}>
        Move the simulator sliders below — the optimistic and pessimistic curves update live.
      </p>
    </div>
  );
}

function Streams({ streams, total }: { streams: typeof incomeStreams, total: number }) {
  return (
    <div style={{ background: '#15151B', borderRadius: 20, padding: 22, border: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ fontSize: 11, color: '#8B8B96', letterSpacing: '0.14em' }}>INCOME STREAMS · LAST 30 DAYS</p>
      <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 18 }}>
        ${total.toLocaleString()} across {streams.length} sources
      </h3>
      <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden' }}>
        {streams.map(s => (
          <div key={s.name} style={{ width: `${s.portion * 100}%`, background: s.color }} />
        ))}
      </div>
      <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
        {streams.map(s => (
          <div key={s.name} className="flex items-center justify-between" style={{ fontSize: 13 }}>
            <div className="flex items-center gap-2">
              <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color, display: 'inline-block' }} />
              <span style={{ color: '#F2F1EE' }}>{s.name}</span>
            </div>
            <div style={{ color: '#8B8B96' }}>
              ${s.amount.toLocaleString()}
              <span style={{ color: '#8B8B96', marginLeft: 8 }}>{(s.portion * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaxLiability() {
  const rows = [
    { label: 'Federal income (estimated)', amount: 38200, due: 'Jun 17', reserved: 27000 },
    { label: 'Self-employment tax',         amount: 11900, due: 'Jun 17', reserved: 11900 },
    { label: 'State (CA)',                  amount: 9450,  due: 'Jun 17', reserved: 9450 },
    { label: 'Payroll taxes (Q2)',          amount: 6200,  due: 'Jul 31', reserved: 6200 },
  ];
  const total    = rows.reduce((s,r) => s + r.amount,   0);
  const reserved = rows.reduce((s,r) => s + r.reserved, 0);
  const gap      = total - reserved;

  return (
    <div style={{ background: '#15151B', borderRadius: 20, padding: 22, border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p style={{ fontSize: 11, color: '#8B8B96', letterSpacing: '0.14em' }}>LIVE TAX LIABILITY · 2025</p>
          <h3 style={{ fontSize: 17, fontWeight: 600 }}>
            ${total.toLocaleString()} estimated · ${reserved.toLocaleString()} reserved
          </h3>
        </div>
        <div style={{
          background: gap > 0 ? 'rgba(192,57,43,0.1)' : 'rgba(61,122,94,0.12)',
          color: gap > 0 ? '#FF6B6B' : '#6FCF97',
          padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
        }}>
          {gap > 0 ? `Under-reserved by $${gap.toLocaleString()}` : 'Fully reserved'}
        </div>
      </div>
      {rows.map((r,i) => (
        <div key={r.label} style={{
          padding: '12px 0',
          borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 8,
          fontSize: 13, alignItems: 'center',
        }}>
          <span style={{ color: '#F2F1EE', fontWeight: 500 }}>{r.label}</span>
          <span style={{ color: '#8B8B96' }}>Due {r.due}</span>
          <span style={{ color: '#F2F1EE' }}>${r.amount.toLocaleString()}</span>
          <span style={{ color: r.reserved >= r.amount ? '#6FCF97' : '#FF6B6B' }}>
            ${r.reserved.toLocaleString()} reserved
          </span>
        </div>
      ))}
    </div>
  );
}

function AskMarcus() {
  const [q, setQ] = useState('');
  const [msgs, setMsgs] = useState<{role:'user'|'ai'; text:string}[]>([
    { role: 'ai', text: "I'm watching cash, revenue, and tax in real time. Ask me anything about the business — I'll answer from your actual numbers." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  function send() {
    const t = q.trim();
    if (!t) return;
    setMsgs(m => [...m, { role: 'user', text: t }]);
    setQ('');
    setTimeout(() => {
      setMsgs(m => [...m, { role: 'ai', text: synthAnswer(t) }]);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 380);
  }

  return (
    <div style={{
      background: '#15151B', borderRadius: 20, padding: 0, marginTop: 24,
      border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 10, background: '#2C3E50',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13,
        }}>M</div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Ask Marcus · CFO</p>
          <p style={{ fontSize: 11, color: '#8B8B96' }}>Reads your live P&L, cash, and tax data.</p>
        </div>
      </div>

      <div style={{ padding: 20, maxHeight: 320, overflowY: 'auto' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 10,
          }}>
            <div style={{
              background: m.role === 'user' ? '#7B6FE8' : 'rgba(255,255,255,0.05)',
              color: m.role === 'user' ? 'white' : '#F2F1EE',
              padding: '10px 14px', borderRadius: 14, maxWidth: '78%',
              fontSize: 13.5, lineHeight: 1.5,
            }}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="What if I raise prices 8% next quarter?"
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)',
            outline: 'none', borderRadius: 12, padding: '11px 14px', fontSize: 13.5,
            color: '#F2F1EE',
          }}
        />
        <button onClick={send} style={{
          background: '#7B6FE8', color: 'white', borderRadius: 12,
          padding: '0 14px', display: 'flex', alignItems: 'center',
        }}><Send size={15} /></button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tiny helpers
───────────────────────────────────────────── */

function Slider({
  label, sub, min, max, value, onChange,
}: {
  label: string; sub: string; min: number; max: number;
  value: number; onChange: (n: number) => void;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <div className="flex items-center justify-between mb-1.5">
        <p style={{ fontSize: 13, fontWeight: 600, color: '#F2F1EE' }}>{label}</p>
        <p style={{ fontSize: 11, color: '#8B8B96' }}>{sub}</p>
      </div>
      <input
        type="range"
        min={min} max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#7B6FE8' }}
      />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />
      {label}
    </span>
  );
}

function pillBtn(bg: string, color: string): React.CSSProperties {
  return {
    background: bg, color, borderRadius: 999,
    padding: '7px 14px', fontSize: 12, fontWeight: 600,
  };
}

// Lightweight canned synthesizer — the real version routes to Marcus via the
// chat API with the user's live business data in context.
function synthAnswer(q: string): string {
  const l = q.toLowerCase();
  if (l.includes('price') || l.includes('raise'))
    return "An 8% lift on your current $184k MRR adds ~$14.7k/mo. With your historical 4% churn elasticity on price changes, net is +$12.5k/mo — which adds about 1.3 months to runway.";
  if (l.includes('hire'))
    return "One senior engineer at $11k loaded burns ~0.4 months of runway. You can fit 2 hires inside Q3 and still keep runway above 12 months — provided MRR keeps trending at +6% MoM.";
  if (l.includes('tax'))
    return "You're $11k short on the federal Q2 reserve. Move $11k from operating to the tax holding account today and you're fully covered through July 31.";
  if (l.includes('runway') || l.includes('cash'))
    return "Cash $1.42M · runway 14.8 months at current $96.4k burn. If the AWS spike sustains, runway drops to 14.1. Worth resolving this week.";
  return "Pulling that from your live data. Short version: you're tracking ahead of plan on revenue, slightly behind on burn discipline. Want me to break it down by category?";
}
