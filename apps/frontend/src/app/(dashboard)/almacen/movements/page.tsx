'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import api from '@/lib/api';

interface Movement {
  id: string;
  movementType: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
  asset: { name: string; plaque: string | null } | null;
  requestedBy: { firstName: string; lastName: string } | null;
}

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  ENTRADA_COMPRA: { label: 'Entrada compra', color: 'bg-green-100 text-green-800' },
  ENTRADA_DONACION: { label: 'Entrada donación', color: 'bg-green-100 text-green-800' },
  ENTRADA_TRASLADO: { label: 'Entrada traslado', color: 'bg-blue-100 text-blue-800' },
  SALIDA_AUTORIZADA: { label: 'Salida autorizada', color: 'bg-red-100 text-red-800' },
  SALIDA_BAJA: { label: 'Baja', color: 'bg-gray-100 text-gray-700' },
  SALIDA_TRASLADO: { label: 'Salida traslado', color: 'bg-orange-100 text-orange-800' },
  AJUSTE_POSITIVO: { label: 'Ajuste +', color: 'bg-cyan-100 text-cyan-800' },
  AJUSTE_NEGATIVO: { label: 'Ajuste -', color: 'bg-yellow-100 text-yellow-800' },
  TRANSFERENCIA_DESPACHO: { label: 'Despacho', color: 'bg-purple-100 text-purple-800' },
  TRANSFERENCIA_RECEPCION: { label: 'Recepción', color: 'bg-indigo-100 text-indigo-800' },
};

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/v1/almacen/movements?limit=100')
      .then((r) => setMovements(Array.isArray(r.data) ? r.data : r.data.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Movimientos</h1>
        <p className="mt-1 text-sm text-gray-500">Últimos movimientos de activos</p>
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
                const tp = TYPE_LABEL[m.movementType] ?? { label: m.movementType, color: 'bg-gray-100 text-gray-600' };
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
                    <td className="px-4 py-3 text-gray-600">
                      {m.requestedBy ? `${m.requestedBy.firstName} ${m.requestedBy.lastName}` : '—'}
                    </td>
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
    </div>
  );
}
