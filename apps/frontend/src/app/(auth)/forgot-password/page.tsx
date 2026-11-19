'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; resetToken?: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error al procesar la solicitud');
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">Recuperar contraseña</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ingresa tu correo institucional
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Correo institucional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="usuario@ceminsa.gov.co"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Solicitar recuperación'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800 text-sm">{result.message}</p>
            </div>

            {result.resetToken && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Token de recuperación:</p>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 break-all">
                  <code className="text-xs text-gray-800">{result.resetToken}</code>
                </div>
                <p className="text-xs text-gray-500">
                  Copia este token y úsalo en la página de restablecimiento. Expira en 1 hora.
                </p>
                <Link
                  href={`/reset-password?token=${result.resetToken}`}
                  className="block w-full text-center bg-primary hover:opacity-90 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
                >
                  Ir a restablecer contraseña →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
