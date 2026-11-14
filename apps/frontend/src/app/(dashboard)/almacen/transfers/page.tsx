'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import api from '@/lib/api';

interface Transfer {
  id: string;
  status: string;
  reason: string | null;
  createdAt: string;
  fromSede: { name: string } | null;
  toSede: { name: string } | null;
  _count?: { items: number };
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  EN_TRANSITO: { label: 'En tránsito', color: 'bg-blue-100 text-blue-800' },
  COMPLETADO: { label: 'Completado', color: 'bg-green-100 text-green-800' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/v1/almacen/transfers?page=${page}&limit=25`);
      const items = Array.isArray(data) ? data : data.data ?? [];
      const totalCount = Array.isArray(data) ? data.length : data.meta?.total ?? items.length;
      setTransfers(items);
      setTotal(totalCount);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Traslados</h1>
          <p className="mt-1 text-sm text-gray-500">{total} traslados registrados</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center text-red-400">
            <p className="text-sm">Error al cargar los traslados</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <ArrowRightLeft className="h-10 w-10 mb-2" />
            <p className="text-sm">No hay traslados registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Origen</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Destino</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Ítems</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.map((t) => {
                const st = STATUS_LABEL[t.status] ?? { label: t.status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{t.fromSede?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{t.toSede?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t._count?.items ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50">Anterior</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
