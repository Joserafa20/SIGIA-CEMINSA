'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import api from '@/lib/api';

interface Asset {
  id: string;
  name: string;
  plaque: string | null;
  institutionalCode: string | null;
  serial: string | null;
  brand: string | null;
  status: string;
  category: { name: string } | null;
  sede: { name: string } | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  EXCELENTE: { label: 'Excelente', color: 'bg-green-100 text-green-800' },
  BUENO: { label: 'Bueno', color: 'bg-blue-100 text-blue-800' },
  REGULAR: { label: 'Regular', color: 'bg-yellow-100 text-yellow-800' },
  MALO: { label: 'Malo', color: 'bg-red-100 text-red-800' },
  BAJA: { label: 'Baja', color: 'bg-gray-100 text-gray-600' },
  EN_TRANSITO: { label: 'En tránsito', color: 'bg-purple-100 text-purple-800' },
};

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search) params.set('search', search);
      const { data } = await api.get(`/v1/almacen/assets?${params}`);
      setAssets(data.data);
      setTotal(data.meta.total);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activos</h1>
          <p className="mt-1 text-sm text-gray-500">{total} activos registrados</p>
        </div>
        <button
          onClick={() => router.push('/almacen/assets/new')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo activo
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, placa, código, serial..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <Package className="h-10 w-10 mb-2" />
            <p className="text-sm">No hay activos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Placa</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Categoría</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Sede</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset) => {
                const status = STATUS_LABEL[asset.status] ?? { label: asset.status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <tr
                    key={asset.id}
                    onClick={() => router.push(`/almacen/assets/${asset.id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{asset.name}</p>
                      {asset.serial && <p className="text-xs text-gray-400">S/N: {asset.serial}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{asset.plaque ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.sede?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
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

// Need the icon for empty state
function Package({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7" />
    </svg>
  );
}
