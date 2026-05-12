import { useState } from 'react';
import { useLocation } from 'wouter';
import KleoLogo from '../components/KleoLogo';
import { signUp } from '../lib/auth';

export default function SignupPage() {
  const [, navigate] = useLocation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { user, error: err } = signUp(email, password, firstName, lastName);
    setLoading(false);
    if (err) {
      setError(err);
    } else if (user) {
      navigate('/');
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full px-6 overflow-y-auto py-8"
      style={{ background: '#F2F1EE' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <KleoLogo size={56} bgColor="#F2F1EE" accentColor="#505A98" />
          <p
            style={{
              fontSize: 11,
              fontWeight: 300,
              letterSpacing: '0.5em',
              color: '#888888',
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
              color: '#1A1A1A',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: '#888888', marginTop: 4, textAlign: 'center' }}>
            Free to start. No credit card required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="flex-1 px-4 py-3.5 rounded-2xl"
              style={{
                background: '#ECEAE4',
                border: '1px solid rgba(0,0,0,0.06)',
                color: '#1A1A1A',
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="flex-1 px-4 py-3.5 rounded-2xl"
              style={{
                background: '#ECEAE4',
                border: '1px solid rgba(0,0,0,0.06)',
                color: '#1A1A1A',
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-2xl"
            style={{
              background: '#ECEAE4',
              border: '1px solid rgba(0,0,0,0.06)',
              color: '#1A1A1A',
              fontSize: 15,
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />
          <input
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-2xl"
            style={{
              background: '#ECEAE4',
              border: '1px solid rgba(0,0,0,0.06)',
              color: '#1A1A1A',
              fontSize: 15,
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />

          {error && (
            <p style={{ fontSize: 13, color: '#C0392B', textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base mt-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: '#505A98' }}
          >
            {loading ? 'Creating account...' : 'Create Account — Free'}
          </button>
        </form>

        <p
          style={{
            fontSize: 11,
            color: '#AAAAAA',
            textAlign: 'center',
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>

        <div className="text-center mt-6">
          <p style={{ fontSize: 14, color: '#888888' }}>
            Already have an account?{' '}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/login'); }}
              style={{ color: '#505A98', fontWeight: 500, textDecoration: 'none' }}
            >
              Sign in
            </a>
          </p>
        </div>

        <p
          style={{
            fontSize: 11,
            color: '#AAAAAA',
            textAlign: 'center',
            marginTop: 32,
          }}
        >
          Built by Deepmarket
        </p>
      </div>
    </div>
  );
}
