'use client';

import { useEffect, useState } from 'react';
import { Plus, Tag, X } from 'lucide-react';
import api from '@/lib/api';

interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  assetType: string;
  _count?: { assets: number };
}

const ASSET_TYPE_LABEL: Record<string, string> = {
  TANGIBLE: 'Tangible',
  INTANGIBLE: 'Intangible',
  BIENES_CONSUMO: 'Bienes de Consumo',
};

const empty = { code: '', name: '', description: '', assetType: 'TANGIBLE' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/v1/almacen/categories')
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : r.data.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/v1/almacen/categories', {
        code: form.code,
        name: form.name,
        description: form.description || undefined,
        assetType: form.assetType,
      });
      setForm(empty);
      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? 'Error al crear la categoría');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-sm text-gray-500">Categorías de activos del inventario</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(''); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="rounded-xl border border-primary/20 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Nueva categoría</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="Ej. MOB-001"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej. Mobiliario"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de activo *</label>
              <select
                value={form.assetType}
                onChange={(e) => setForm((f) => ({ ...f, assetType: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="TANGIBLE">Tangible</option>
                <option value="INTANGIBLE">Intangible</option>
                <option value="BIENES_CONSUMO">Bienes de Consumo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Opcional"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {formError && (
              <p className="col-span-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}
            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium"
              >
                {saving ? 'Guardando…' : 'Crear categoría'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

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
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Crear la primera categoría
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Código</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Activos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                      {ASSET_TYPE_LABEL[cat.assetType] ?? cat.assetType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cat.description ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{cat._count?.assets ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
