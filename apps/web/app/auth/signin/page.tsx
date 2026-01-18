'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import ParticleBackground from '@/components/ParticleBackground';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiClient.sendMagicLink(email);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ParticleBackground />
      
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-cosmic-surface/80 backdrop-blur-md border border-cosmic-border rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Sign In</h1>
          <p className="text-gray-400 text-center mb-8">
            Enter your email to receive a magic link
          </p>

          {submitted ? (
            <div className="text-center">
              <div className="text-cosmic-accent text-5xl mb-4">✓</div>
              <p className="text-lg mb-2">Check your email!</p>
              <p className="text-gray-400 text-sm">
                We sent a magic link to <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-cosmic-bg border border-cosmic-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cosmic-primary"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-cosmic-primary hover:bg-cosmic-secondary rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
