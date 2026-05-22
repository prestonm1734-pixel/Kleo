'use client';

import { useState } from 'react';
import Link from 'next/link';
import KleoLogo from '@/components/KleoLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full px-6"
      style={{ background: '#0B0B0F' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <KleoLogo size={52} bgColor="#0B0B0F" accentColor="#7B6FE8" />
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#F2F1EE',
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            Reset your password
          </h1>
          <p style={{ fontSize: 14, color: '#8B8B96', marginTop: 6, textAlign: 'center' }}>
            {submitted
              ? 'Check your email for reset instructions.'
              : "Enter your email and we'll send you a link."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-2xl"
              style={{
                background: '#15151B',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#F2F1EE',
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-white font-semibold text-base mt-2 hover:opacity-90 transition-all"
              style={{ background: '#7B6FE8' }}
            >
              Send Reset Link
            </button>
          </form>
        ) : (
          <div
            className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(80,90,152,0.08)' }}
          >
            <p style={{ fontSize: 14, color: '#7B6FE8' }}>
              If an account exists for <strong>{email}</strong>, you'll receive reset instructions shortly.
            </p>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/login" style={{ fontSize: 14, color: '#7B6FE8', fontWeight: 500, textDecoration: 'none' }}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
