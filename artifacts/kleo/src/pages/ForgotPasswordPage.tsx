import { useState } from 'react';
import { useLocation } from 'wouter';
import KleoLogo from '../components/KleoLogo';

export default function ForgotPasswordPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full px-6"
      style={{ background: '#F2F1EE' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <KleoLogo size={52} bgColor="#F2F1EE" accentColor="#505A98" />
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#1A1A1A',
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            Reset your password
          </h1>
          <p style={{ fontSize: 14, color: '#888888', marginTop: 6, textAlign: 'center' }}>
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
                background: '#ECEAE4',
                border: '1px solid rgba(0,0,0,0.06)',
                color: '#1A1A1A',
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-white font-semibold text-base mt-2 hover:opacity-90 transition-all"
              style={{ background: '#505A98' }}
            >
              Send Reset Link
            </button>
          </form>
        ) : (
          <div
            className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(80,90,152,0.08)' }}
          >
            <p style={{ fontSize: 14, color: '#505A98' }}>
              If an account exists for <strong>{email}</strong>, you'll receive reset instructions shortly.
            </p>
          </div>
        )}

        <div className="text-center mt-6">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
            style={{ fontSize: 14, color: '#505A98', fontWeight: 500, textDecoration: 'none' }}
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
