'use client';

import { ArrowUpRight, Receipt, XCircle, FileText, PiggyBank, Repeat, AlertCircle } from 'lucide-react';
import { LucaFinding, LucaFindingKind } from '@/types';

interface LucaFindingCardProps {
  finding: LucaFinding;
  /** Index for staggered slide-in delay. */
  index?: number;
}

export default function LucaFindingCard({ finding, index = 0 }: LucaFindingCardProps) {
  return (
    <div
      className="finding-slide-in"
      style={{
        animationDelay: `${index * 110}ms`,
        background: 'linear-gradient(180deg, #1C1C24 0%, #20202A 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: 16,
        margin: '0 auto 10px',
        maxWidth: 720,
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(123,111,232,0.16)',
            color: '#9D8FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <KindIcon kind={finding.kind} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
            <p style={{ color: '#F2F1EE', fontWeight: 600, fontSize: 14.5, lineHeight: 1.3 }}>
              {finding.title}
            </p>
          </div>
          <p style={{ color: '#8B8B96', fontSize: 12.5, lineHeight: 1.5, marginTop: 4 }}>
            {finding.detail}
          </p>
          <div className="flex items-center gap-3" style={{ marginTop: 10 }}>
            <span
              style={{
                fontSize: 10.5,
                letterSpacing: '0.06em',
                color: '#5A5A66',
                textTransform: 'uppercase',
              }}
            >
              {finding.source}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p
            style={{
              fontSize: 11,
              color: '#5A5A66',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {kindBadge(finding.kind)}
          </p>
          <p
            style={{
              color: '#9D8FFF',
              fontWeight: 700,
              fontSize: 20,
              marginTop: 2,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            +${finding.amount >= 100 ? Math.round(finding.amount) : finding.amount.toFixed(2)}
          </p>
          {finding.kind === 'cancel_subscription' || finding.kind === 'savings_arbitrage' ? (
            <p style={{ fontSize: 10, color: '#5A5A66' }}>per year</p>
          ) : null}
        </div>
      </div>

      {finding.evidence && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10,
            color: '#8B8B96',
            fontSize: 11.5,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: '#9D8FFF', fontWeight: 600 }}>Why Luca flagged this — </span>
          {finding.evidence}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={() => finding.action.href && window.open(finding.action.href, '_blank')}
          style={{
            background: '#7B6FE8',
            color: 'white',
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: 12.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {finding.action.label}
          {finding.action.href && <ArrowUpRight size={12} />}
        </button>
        <button
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: '#8B8B96',
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: 12.5,
            fontWeight: 500,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function KindIcon({ kind }: { kind: LucaFindingKind }) {
  switch (kind) {
    case 'fee_dispute':         return <Receipt size={18} />;
    case 'cancel_subscription': return <XCircle size={18} />;
    case 'tax_match':           return <FileText size={18} />;
    case 'savings_arbitrage':   return <PiggyBank size={18} />;
    case 'refinance':           return <Repeat size={18} />;
    case 'duplicate_charge':    return <AlertCircle size={18} />;
    default:                    return <AlertCircle size={18} />;
  }
}

function kindBadge(kind: LucaFindingKind): string {
  switch (kind) {
    case 'fee_dispute':         return 'FEE DISPUTE';
    case 'cancel_subscription': return 'CANCEL';
    case 'tax_match':           return 'TAX DEDUCTION';
    case 'savings_arbitrage':   return 'SAVINGS ARB';
    case 'refinance':           return 'REFINANCE';
    case 'duplicate_charge':    return 'DUPLICATE';
    default:                    return 'OPPORTUNITY';
  }
}
