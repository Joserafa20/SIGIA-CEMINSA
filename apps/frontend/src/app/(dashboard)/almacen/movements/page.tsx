'use client';

import { useEffect, useState, useCallback } from 'react';
import { Activity } from 'lucide-react';
import api from '@/lib/api';

interface Movement {
  id: string;
  type: string;
  quantity: number;
  reason: string | null;
  createdAt: string;
  asset: { name: string; plaque: string | null } | null;
  user: { name: string } | null;
}

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  ENTRADA: { label: 'Entrada', color: 'bg-green-100 text-green-800' },
  SALIDA: { label: 'Salida', color: 'bg-red-100 text-red-800' },
  TRASLADO: { label: 'Traslado', color: 'bg-blue-100 text-blue-800' },
  BAJA: { label: 'Baja', color: 'bg-gray-100 text-gray-700' },
};

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/v1/almacen/movements?page=${page}&limit=25`);
      const items = Array.isArray(data) ? data : data.data ?? [];
      const totalCount = Array.isArray(data) ? data.length : data.meta?.total ?? items.length;
      setMovements(items);
      setTotal(totalCount);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchMovements(); }, [fetchMovements]);

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimientos</h1>
          <p className="mt-1 text-sm text-gray-500">{total} movimientos registrados</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center text-red-400">
            <p className="text-sm">Error al cargar los movimientos</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <Activity className="h-10 w-10 mb-2" />
            <p className="text-sm">No hay movimientos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Activo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Cant.</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Registrado por</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.map((m) => {
                const tp = TYPE_LABEL[m.type] ?? { label: m.type, color: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{m.asset?.name ?? '—'}</p>
                      {m.asset?.plaque && <p className="text-xs text-gray-400">{m.asset.plaque}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tp.color}`}>{tp.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{m.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">{m.user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(m.createdAt).toLocaleDateString('es-CO')}
                    </td>
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
