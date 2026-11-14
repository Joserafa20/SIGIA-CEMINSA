'use client';

import { useEffect, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import api from '@/lib/api';

interface AssetMovement {
  id: string;
}

interface Transfer {
  id: string;
  status: string;
  dispatchedAt: string;
  originSede: { name: string } | null;
  destinationSede: { name: string } | null;
  movements: AssetMovement[];
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  DESPACHADO: { label: 'Despachado', color: 'bg-yellow-100 text-yellow-800' },
  EN_TRANSITO: { label: 'En tránsito', color: 'bg-blue-100 text-blue-800' },
  RECIBIDO: { label: 'Recibido', color: 'bg-green-100 text-green-800' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/v1/almacen/transfers')
      .then((r) => setTransfers(Array.isArray(r.data) ? r.data : r.data.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Traslados</h1>
        <p className="mt-1 text-sm text-gray-500">{transfers.length} traslados registrados</p>
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
                    <td className="px-4 py-3 text-gray-700">{t.originSede?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{t.destinationSede?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(t.dispatchedAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.movements.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
