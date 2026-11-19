'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, X, ArrowRight, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface Sede {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  name: string;
  plaque: string | null;
  institutionalCode: string | null;
  sede: { id: string; name: string } | null;
}

interface Transfer {
  id: string;
  status: string;
  documentRef: string | null;
  notes: string | null;
  createdAt: string;
  fromSede: { name: string };
  toSede: { name: string };
  items: { asset: { name: string; plaque: string | null } }[];
  createdBy: { firstName: string; lastName: string };
}

const STATUS_STYLE: Record<string, string> = {
  DESPACHADO: 'bg-blue-100 text-blue-800',
  EN_TRANSITO: 'bg-yellow-100 text-yellow-800',
  RECIBIDO: 'bg-green-100 text-green-800',
  RECHAZADO: 'bg-red-100 text-red-800',
};

const STATUS_LABEL: Record<string, string> = {
  DESPACHADO: 'Despachado',
  EN_TRANSITO: 'En tránsito',
  RECIBIDO: 'Recibido',
  RECHAZADO: 'Rechazado',
};

const empty = { fromSedeId: '', toSedeId: '', documentRef: '', notes: '' };

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [advancing, setAdvancing] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/v1/almacen/transfers')
      .then((r) => setTransfers(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openForm = () => {
    setForm(empty);
    setSelectedAssets([]);
    setFormError('');
    Promise.all([api.get('/v1/sedes'), api.get('/v1/almacen/assets?limit=200')])
      .then(([s, a]) => {
        setSedes(s.data);
        setAssets(Array.isArray(a.data) ? a.data : a.data.data ?? []);
      });
    setShowForm(true);
  };

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filteredAssets = assets.filter(
    (a) => !form.fromSedeId || a.sede?.id === form.fromSedeId,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssets.length === 0) {
      setFormError('Selecciona al menos un activo para trasladar.');
      return;
    }
    if (form.fromSedeId === form.toSedeId) {
      setFormError('La sede de origen y destino deben ser diferentes.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await api.post('/v1/almacen/transfers', {
        fromSedeId: form.fromSedeId,
        toSedeId: form.toSedeId,
        assetIds: selectedAssets,
        documentRef: form.documentRef || undefined,
        notes: form.notes || undefined,
      });
      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? 'Error al crear el traslado');
    } finally {
      setSaving(false);
    }
  };

  const handleAdvance = async (id: string) => {
    setAdvancing(id);
    try {
      await api.patch(`/v1/almacen/transfers/${id}/advance`);
      load();
    } finally {
      setAdvancing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Traslados</h1>
          <p className="mt-1 text-sm text-gray-500">{transfers.length} traslados registrados</p>
        </div>
        <button
          onClick={openForm}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nuevo traslado
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-primary/20 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Nuevo traslado</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sede origen *</label>
                <select
                  required
                  value={form.fromSedeId}
                  onChange={(e) => { setForm((f) => ({ ...f, fromSedeId: e.target.value })); setSelectedAssets([]); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar sede...</option>
                  {sedes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sede destino *</label>
                <select
                  required
                  value={form.toSedeId}
                  onChange={(e) => setForm((f) => ({ ...f, toSedeId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar sede...</option>
                  {sedes.filter((s) => s.id !== form.fromSedeId).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {form.fromSedeId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activos a trasladar * <span className="text-gray-400 font-normal">(activos en la sede origen)</span>
                </label>
                {filteredAssets.length === 0 ? (
                  <p className="text-sm text-gray-400 py-3">No hay activos en esta sede.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {filteredAssets.map((a) => (
                      <label key={a.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(a.id)}
                          onChange={() => toggleAsset(a.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{a.name}</p>
                          {(a.plaque || a.institutionalCode) && (
                            <p className="text-xs text-gray-400">{a.plaque ?? a.institutionalCode}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {selectedAssets.length > 0 && (
                  <p className="text-xs text-primary mt-1">{selectedAssets.length} activo(s) seleccionado(s)</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° acta / documento</label>
                <input
                  value={form.documentRef}
                  onChange={(e) => setForm((f) => ({ ...f, documentRef: e.target.value }))}
                  placeholder="Ej. ACTA-2024-001"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Opcional"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-primary text-white px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium">
                {saving ? 'Guardando…' : 'Crear traslado'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-50 text-sm">
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
        ) : transfers.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <ArrowRight className="h-10 w-10 mb-2" />
            <p className="text-sm">No hay traslados registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Ruta</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Activos</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Documento</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-900 font-medium">
                      <span>{t.fromSede?.name ?? '—'}</span>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                      <span>{t.toSede?.name ?? '—'}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{t.createdBy?.firstName} {t.createdBy?.lastName}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.items?.length ?? 0} activo(s)
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.documentRef ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(t.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    {t.status !== 'RECIBIDO' && t.status !== 'RECHAZADO' && (
                      <button
                        onClick={() => handleAdvance(t.id)}
                        disabled={advancing === t.id}
                        className="text-xs text-primary border border-primary/30 rounded-md px-3 py-1 hover:bg-primary/5 disabled:opacity-50"
                      >
                        {advancing === t.id ? '…' : 'Avanzar estado'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
