'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import api from '@/lib/api';

const STATUS_COLOR: Record<string, string> = {
  ABIERTO: 'bg-blue-100 text-blue-800',
  EN_PROGRESO: 'bg-yellow-100 text-yellow-800',
  RESUELTO: 'bg-green-100 text-green-800',
  CERRADO: 'bg-gray-100 text-gray-600',
  CANCELADO: 'bg-red-100 text-red-700',
};

const PRIORITY_COLOR: Record<string, string> = {
  BAJA: 'bg-gray-100 text-gray-600',
  MEDIA: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-orange-100 text-orange-700',
  CRITICA: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = ['', 'ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO', 'CANCELADO'];

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('ABIERTO');
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (filterStatus) params.set('status', filterStatus);
      const { data } = await api.get(`/v1/sistemas/tickets?${params}`);
      setTickets(data.data);
      setTotal(data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets de soporte</h1>
          <p className="mt-1 text-sm text-gray-500">{total} tickets</p>
        </div>
        <button
          onClick={() => router.push('/sistemas/tickets/new')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo ticket
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filterStatus === s
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s || 'Todos'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : tickets.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">No hay tickets con este filtro</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Título</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Equipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Prioridad</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Asignado a</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((t: any) => (
                <tr
                  key={t.id}
                  onClick={() => router.push(`/sistemas/tickets/${t.id}`)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-400">
                      {t.createdBy?.firstName} {t.createdBy?.lastName}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {t.techAsset?.asset?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLOR[t.priority] ?? ''}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[t.status] ?? ''}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {Math.ceil(total / 25) > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>Página {page} de {Math.ceil(total / 25)}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50">Anterior</button>
            <button disabled={page === Math.ceil(total / 25)} onClick={() => setPage((p) => p + 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
