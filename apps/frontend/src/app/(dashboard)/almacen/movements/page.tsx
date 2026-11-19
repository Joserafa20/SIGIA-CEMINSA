'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, X, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface Asset {
  id: string;
  name: string;
  plaque: string | null;
  institutionalCode: string | null;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Movement {
  id: string;
  movementType: string;
  quantity: number;
  documentRef: string | null;
  notes: string | null;
  createdAt: string;
  asset: { name: string; plaque: string | null };
  requestedBy: { firstName: string; lastName: string };
  authorizedBy: { firstName: string; lastName: string } | null;
}

const MOVEMENT_LABEL: Record<string, string> = {
  ENTRADA_COMPRA: 'Entrada por compra',
  ENTRADA_DONACION: 'Entrada por donación',
  ENTRADA_TRASLADO: 'Entrada por traslado',
  SALIDA_AUTORIZADA: 'Salida autorizada',
  SALIDA_BAJA: 'Salida por baja',
  SALIDA_TRASLADO: 'Salida por traslado',
  AJUSTE_POSITIVO: 'Ajuste positivo',
  AJUSTE_NEGATIVO: 'Ajuste negativo',
};

const MOVEMENT_GROUPS = {
  'Entradas': ['ENTRADA_COMPRA', 'ENTRADA_DONACION'],
  'Salidas': ['SALIDA_AUTORIZADA', 'SALIDA_BAJA'],
  'Ajustes': ['AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'],
};

function isEntrada(type: string) { return type.startsWith('ENTRADA'); }
function isAjuste(type: string) { return type.startsWith('AJUSTE'); }

const empty = { assetId: '', movementType: '', quantity: '1', documentRef: '', notes: '', authorizedById: '' };

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const needsAuthorizer = ['SALIDA_AUTORIZADA', 'SALIDA_BAJA', 'AJUSTE_NEGATIVO'].includes(form.movementType);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/v1/almacen/movements')
      .then((r) => setMovements(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openForm = () => {
    setForm(empty);
    setFormError('');
    Promise.all([
      api.get('/v1/almacen/assets?limit=200'),
      api.get('/v1/users'),
    ]).then(([a, u]) => {
      setAssets(Array.isArray(a.data) ? a.data : a.data.data ?? []);
      setUsers(Array.isArray(u.data) ? u.data : u.data.data ?? []);
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/v1/almacen/movements', {
        assetId: form.assetId,
        movementType: form.movementType,
        quantity: Number(form.quantity),
        documentRef: form.documentRef || undefined,
        notes: form.notes || undefined,
        authorizedById: form.authorizedById || undefined,
      });
      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? 'Error al registrar el movimiento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimientos</h1>
          <p className="mt-1 text-sm text-gray-500">{movements.length} movimientos registrados</p>
        </div>
        <button
          onClick={openForm}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Registrar movimiento
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-primary/20 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Registrar movimiento</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Activo *</label>
              <select
                required
                value={form.assetId}
                onChange={(e) => setForm((f) => ({ ...f, assetId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccionar activo...</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}{a.plaque ? ` — ${a.plaque}` : a.institutionalCode ? ` — ${a.institutionalCode}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de movimiento *</label>
              <select
                required
                value={form.movementType}
                onChange={(e) => setForm((f) => ({ ...f, movementType: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccionar tipo...</option>
                {Object.entries(MOVEMENT_GROUPS).map(([group, types]) => (
                  <optgroup key={group} label={group}>
                    {types.map((t) => (
                      <option key={t} value={t}>{MOVEMENT_LABEL[t]}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
              <input
                required
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° documento soporte</label>
              <input
                value={form.documentRef}
                onChange={(e) => setForm((f) => ({ ...f, documentRef: e.target.value }))}
                placeholder="Factura, acta, resolución..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {needsAuthorizer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autorizado por *</label>
                <select
                  required={needsAuthorizer}
                  value={form.authorizedById}
                  onChange={(e) => setForm((f) => ({ ...f, authorizedById: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Seleccionar usuario...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={needsAuthorizer ? '' : 'col-span-2'}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Justificación o notas adicionales"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {formError && (
              <p className="col-span-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}

            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-primary text-white px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium">
                {saving ? 'Guardando…' : 'Registrar movimiento'}
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
        ) : movements.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <RefreshCw className="h-10 w-10 mb-2" />
            <p className="text-sm">No hay movimientos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Activo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Cant.</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Documento</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Registrado por</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.map((m) => {
                const entrada = isEntrada(m.movementType);
                const ajuste = isAjuste(m.movementType);
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {entrada ? (
                          <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
                        ) : ajuste ? (
                          <RefreshCw className="h-4 w-4 text-blue-500 shrink-0" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                        <span className={`text-xs font-medium ${entrada ? 'text-green-700' : ajuste ? 'text-blue-700' : 'text-red-700'}`}>
                          {MOVEMENT_LABEL[m.movementType] ?? m.movementType}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{m.asset?.name ?? '—'}</p>
                      {m.asset?.plaque && <p className="text-xs text-gray-400">{m.asset.plaque}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">{m.documentRef ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {m.requestedBy ? `${m.requestedBy.firstName} ${m.requestedBy.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
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
