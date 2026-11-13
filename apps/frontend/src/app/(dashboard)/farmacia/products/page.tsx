'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  code: string;
  activePrinciple: string;
  commercialName?: string;
  pharmaceuticalForm?: string;
  category: string;
  isControlled: boolean;
  requiresColdChain: boolean;
  minimumStock?: number;
  isActive: boolean;
  productStock?: Array<{ quantity: number; sede: { name: string } }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  MEDICAMENTO: 'Medicamento',
  DISPOSITIVO_MEDICO: 'Dispositivo médico',
  REACTIVO: 'Reactivo',
  INSUMO: 'Insumo',
  COMODATO: 'Comodato',
};

export default function FarmaciaProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [belowMinimum, setBelowMinimum] = useState(false);
  const [isControlled, setIsControlled] = useState<boolean | undefined>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (belowMinimum) params.set('belowMinimum', 'true');
      if (isControlled !== undefined) params.set('isControlled', String(isControlled));

      const res = await fetch(`/api/v1/farmacia/products?${params}`);
      const json = await res.json();
      setProducts(json.data ?? []);
      setTotal(json.meta?.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, belowMinimum, isControlled]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const totalStock = (p: Product) =>
    p.productStock?.reduce((acc, s) => acc + Number(s.quantity), 0) ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Farmacia — Productos</h1>
        <Link
          href="/farmacia/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Nuevo producto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Buscar principio activo, nombre comercial, código…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={belowMinimum}
            onChange={(e) => { setBelowMinimum(e.target.checked); setPage(1); }}
            className="rounded"
          />
          Bajo mínimo
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={isControlled === true}
            onChange={(e) => { setIsControlled(e.target.checked ? true : undefined); setPage(1); }}
            className="rounded"
          />
          Controlados
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600">Código</th>
              <th className="text-left p-4 font-semibold text-gray-600">Principio activo</th>
              <th className="text-left p-4 font-semibold text-gray-600">Categoría</th>
              <th className="text-left p-4 font-semibold text-gray-600">Flags</th>
              <th className="text-right p-4 font-semibold text-gray-600">Stock total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Cargando…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Sin resultados</td></tr>
            ) : products.map((p) => {
              const stock = totalStock(p);
              const belowMin = p.minimumStock !== null && stock < (p.minimumStock ?? 0);
              return (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/farmacia/products/${p.id}`)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="p-4 font-mono text-gray-500">{p.code}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{p.activePrinciple}</div>
                    {p.commercialName && (
                      <div className="text-xs text-gray-400">{p.commercialName}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700">
                      {CATEGORY_LABELS[p.category] ?? p.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {p.isControlled && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-red-50 text-red-600 font-medium">
                          Controlado
                        </span>
                      )}
                      {p.requiresColdChain && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 font-medium">
                          Cadena frío
                        </span>
                      )}
                      {!p.isActive && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-semibold ${belowMin ? 'text-red-600' : 'text-gray-800'}`}>
                      {stock}
                    </span>
                    {p.minimumStock != null && (
                      <div className="text-xs text-gray-400">mín. {p.minimumStock}</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{total} productos en total</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-3 py-1">Página {page} de {Math.ceil(total / limit)}</span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
