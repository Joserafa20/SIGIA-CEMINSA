'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Monitor } from 'lucide-react';
import api from '@/lib/api';

interface TechAsset {
  id: string;
  qrCode: string | null;
  ipAddress: string | null;
  processor: string | null;
  ramGb: number | null;
  storageGb: number | null;
  operatingSystem: string | null;
  warrantyExpiry: string | null;
  asset: { name: string; plaque: string | null; serial: string | null; status: string; category: { name: string } | null };
  sede: { name: string } | null;
  assignedTo: { firstName: string; lastName: string } | null;
  _count: { licenses: number; maintenances: number; tickets: number };
}

const STATUS_COLOR: Record<string, string> = {
  EXCELENTE: 'bg-green-100 text-green-800',
  BUENO: 'bg-blue-100 text-blue-800',
  REGULAR: 'bg-yellow-100 text-yellow-800',
  MALO: 'bg-red-100 text-red-800',
  BAJA: 'bg-gray-100 text-gray-600',
  EN_TRANSITO: 'bg-purple-100 text-purple-800',
};

export default function SistemasAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<TechAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search) params.set('search', search);
      const { data } = await api.get(`/v1/sistemas/assets?${params}`);
      setAssets(data.data);
      setTotal(data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipos TIC</h1>
          <p className="mt-1 text-sm text-gray-500">{total} equipos registrados</p>
        </div>
        <button
          onClick={() => router.push('/sistemas/assets/new')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Registrar equipo
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, placa, serial, IP, procesador..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <Monitor className="h-10 w-10 mb-2" />
            <p className="text-sm">No hay equipos TIC registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Equipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Especificaciones</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Sede</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Asignado a</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tickets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((tech) => {
                const statusColor = STATUS_COLOR[tech.asset.status] ?? 'bg-gray-100 text-gray-600';
                const hasOpenTickets = tech._count.tickets > 0;
                return (
                  <tr
                    key={tech.id}
                    onClick={() => router.push(`/sistemas/assets/${tech.id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{tech.asset.name}</p>
                      <p className="text-xs text-gray-400">
                        {tech.asset.plaque ?? tech.asset.serial ?? ''}
                        {tech.ipAddress ? ` · ${tech.ipAddress}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {[
                        tech.processor,
                        tech.ramGb ? `${tech.ramGb} GB RAM` : null,
                        tech.storageGb ? `${tech.storageGb} GB` : null,
                        tech.operatingSystem,
                      ]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tech.sede?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {tech.assignedTo
                        ? `${tech.assignedTo.firstName} ${tech.assignedTo.lastName}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
                        {tech.asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {hasOpenTickets ? (
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                          {tech._count.tickets}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
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
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
