'use client';

import { useEffect, useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
  description: string | null;
  _count?: { assets: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/v1/almacen/categories')
      .then((r) => setCategories(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-sm text-gray-500">Categorías de activos del inventario</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center text-red-400">
            <p className="text-sm">Error al cargar las categorías</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <Tag className="h-10 w-10 mb-2" />
            <p className="text-sm">No hay categorías registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Activos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.description ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{cat._count?.assets ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
