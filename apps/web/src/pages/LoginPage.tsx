import { useState } from 'react';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  pin: z.string().length(4, 'PIN must be exactly 4 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      loginSchema.parse({ email, pin });
      setLoading(true);

      const response = await api.post('/auth/login', { email, pin });
      login(response.data.token, response.data.user);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError('Login failed. Check your PIN.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome</h2>
          <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded border border-red-500 bg-red-50/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium">
                4-Digit PIN
              </label>
              <input
                id="pin"
                type="password"
                required
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
