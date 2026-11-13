'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Product { id: string; code: string; activePrinciple: string; }
interface Sede { id: string; name: string; }
interface DispenseResult {
  dispensed: number;
  product: { activePrinciple: string };
  movements: Array<{ lotNumber: string; consumed: number; expiresAt: string | null }>;
}

export default function DispensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preProductId = searchParams.get('productId') ?? '';

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(preProductId);
  const [sedeId, setSedeId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [documentRef, setDocumentRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<DispenseResult | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/sedes').then((r) => r.json()),
      fetch('/api/v1/farmacia/products?limit=200').then((r) => r.json()),
    ]).then(([s, p]) => {
      setSedes(s.data ?? s);
      setProducts(p.data ?? []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/farmacia/stock/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          sedeId,
          quantity: Number(quantity),
          documentRef: documentRef || undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Error al dispensar');
      }
      setResult(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="p-6 max-w-lg">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <h2 className="font-bold text-green-800">Dispensación registrada</h2>
              <p className="text-sm text-green-700">
                {result.dispensed} unidades de {result.product.activePrinciple}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium text-gray-500 text-xs uppercase tracking-wide">Lotes consumidos (FEFO)</p>
            {result.movements.map((m, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-green-100 last:border-0">
                <span className="font-mono">{m.lotNumber}</span>
                <span>
                  {m.consumed} ud.
                  {m.expiresAt && (
                    <span className="text-gray-400 ml-2">
                      (vence {new Date(m.expiresAt).toLocaleDateString('es-CO')})
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setResult(null)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              Nueva dispensación
            </button>
            <button
              onClick={() => router.push('/farmacia/products')}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Ver productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">←</button>
        <h1 className="text-xl font-bold text-gray-900">Dispensar medicamento</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
          FEFO activo — el sistema consumirá primero los lotes con fecha de vencimiento más próxima.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
          <select
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar producto…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.activePrinciple} ({p.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sede *</label>
          <select
            required
            value={sedeId}
            onChange={(e) => setSedeId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar sede…</option>
            {sedes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
          <input
            required
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">N° solicitud / documento</label>
          <input
            value={documentRef}
            onChange={(e) => setDocumentRef(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {submitting ? 'Dispensando…' : 'Dispensar'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-50 text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
