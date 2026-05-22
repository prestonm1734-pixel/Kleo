'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import KleoLogo from '@/components/KleoLogo';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { user, error: err } = signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else if (user) {
      router.push('/');
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full px-6"
      style={{ background: '#0B0B0F' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo & brand */}
        <div className="flex flex-col items-center mb-10">
          <KleoLogo size={56} bgColor="#0B0B0F" accentColor="#7B6FE8" />
          <p
            style={{
              fontSize: 11,
              fontWeight: 300,
              letterSpacing: '0.5em',
              color: '#8B8B96',
              textTransform: 'uppercase',
              marginTop: 12,
            }}
          >
            KLEO
          </p>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#F2F1EE',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Welcome back
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-2xl text-sm"
              style={{
                background: '#15151B',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#F2F1EE',
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-2xl text-sm"
              style={{
                background: '#15151B',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#F2F1EE',
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#FF6B6B', textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base mt-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: '#7B6FE8' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Forgot password */}
        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            style={{ fontSize: 13, color: '#8B8B96', textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign up link */}
        <div className="text-center mt-8">
          <p style={{ fontSize: 14, color: '#8B8B96' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              style={{ color: '#7B6FE8', fontWeight: 500, textDecoration: 'none' }}
            >
              Sign up free
            </Link>
          </p>
        </div>

        {/* Built by */}
        <p
          style={{
            fontSize: 11,
            color: '#5A5A66',
            textAlign: 'center',
            marginTop: 48,
            letterSpacing: '0.02em',
          }}
        >
          Built by Deepmarket
        </p>
      </div>
    </div>
  );
}
