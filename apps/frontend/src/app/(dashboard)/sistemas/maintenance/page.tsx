'use client';

import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Wrench, Monitor } from 'lucide-react';
import api from '@/lib/api';

interface Maintenance {
  id: string;
  type: 'PREVENTIVO' | 'CORRECTIVO';
  description: string;
  status: string;
  scheduledDate: string | null;
  executedDate: string | null;
  nextScheduled: string | null;
  techAsset: { id: string; hostname: string; asset: { name: string } };
  technician: { firstName: string; lastName: string };
}

interface TechAsset {
  id: string;
  hostname: string;
  asset: { name: string };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

const STATUS_COLOR: Record<string, string> = {
  PROGRAMADO:    'bg-blue-100 text-blue-800',
  EN_EJECUCION:  'bg-yellow-100 text-yellow-800',
  COMPLETADO:    'bg-green-100 text-green-800',
  CANCELADO:     'bg-gray-100 text-gray-500',
};

const TYPE_COLOR: Record<string, string> = {
  PREVENTIVO: 'bg-indigo-500',
  CORRECTIVO: 'bg-orange-500',
};

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const empty = { techAssetId: '', type: 'PREVENTIVO', description: '', technicianId: '', scheduledDate: '' };

export default function MaintenanceCalendarPage() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [records, setRecords]     = useState<Maintenance[]>([]);
  const [techAssets, setTechAssets] = useState<TechAsset[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selected, setSelected]   = useState<Maintenance | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(empty);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    api.get('/v1/sistemas/maintenance').then((r) =>
      setRecords(Array.isArray(r.data) ? r.data : r.data.data ?? [])
    );
  };

  useEffect(() => {
    load();
    api.get('/v1/sistemas/assets').then((r) => {
      const list = Array.isArray(r.data) ? r.data : r.data.data ?? [];
      setTechAssets(list);
    });
    api.get('/v1/users').then((r) => {
      setTechnicians(Array.isArray(r.data) ? r.data : r.data.data ?? []);
    });
  }, []);

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = useMemo(() => {
    const map: Record<number, Maintenance[]> = {};
    for (const m of records) {
      const date = m.scheduledDate ?? m.executedDate;
      if (!date) continue;
      const d = new Date(date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(m);
      }
    }
    return map;
  }, [records, year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/v1/sistemas/maintenance', {
        techAssetId: form.techAssetId,
        type: form.type,
        description: form.description,
        technicianId: form.technicianId,
        scheduledDate: form.scheduledDate || undefined,
      });
      setForm(empty);
      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? 'Error al programar el mantenimiento');
    } finally {
      setSaving(false);
    }
  };

  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 ? day : null;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Mantenimientos</h1>
          <p className="mt-1 text-sm text-gray-500">Mantenimientos programados de equipos TIC</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(''); setSelected(null); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Programar mantenimiento
        </button>
      </div>

      {/* New maintenance form */}
      {showForm && (
        <div className="rounded-xl border border-primary/20 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Programar mantenimiento</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipo TIC *</label>
              <select required value={form.techAssetId}
                onChange={(e) => setForm((f) => ({ ...f, techAssetId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Seleccionar equipo...</option>
                {techAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.asset?.name ?? a.hostname} {a.hostname ? `(${a.hostname})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="PREVENTIVO">Preventivo</option>
                <option value="CORRECTIVO">Correctivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico responsable *</label>
              <select required value={form.technicianId}
                onChange={(e) => setForm((f) => ({ ...f, technicianId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Seleccionar técnico...</option>
                {technicians.map((u) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha programada</label>
              <input type="date" value={form.scheduledDate}
                onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea required rows={2} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del mantenimiento a realizar"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            {formError && (
              <p className="col-span-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-primary text-white px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium">
                {saving ? 'Guardando…' : 'Programar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-50 text-sm">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button onClick={prevMonth} className="rounded-md p-1.5 hover:bg-gray-100 text-gray-500">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="font-semibold text-gray-900">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="rounded-md p-1.5 hover:bg-gray-100 text-gray-500">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="border-b border-r border-gray-50 min-h-[80px]" />;
              const events = eventsByDay[day] ?? [];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div key={i}
                  className="border-b border-r border-gray-100 min-h-[80px] p-1 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => events.length === 1 && setSelected(events[0])}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 ${
                    isToday ? 'bg-primary text-white' : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                  {events.slice(0, 2).map((ev) => (
                    <div key={ev.id}
                      onClick={(e) => { e.stopPropagation(); setSelected(ev); }}
                      className={`text-white text-xs rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer ${TYPE_COLOR[ev.type] ?? 'bg-gray-400'}`}
                      title={ev.techAsset?.asset?.name ?? ev.techAsset?.hostname}
                    >
                      {ev.techAsset?.asset?.name ?? ev.techAsset?.hostname ?? 'Equipo'}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-gray-400 px-1">+{events.length - 2} más</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tipos</h3>
            <div className="space-y-2">
              {[['PREVENTIVO', 'Preventivo'], ['CORRECTIVO', 'Correctivo']].map(([k, l]) => (
                <div key={k} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${TYPE_COLOR[k]}`} />
                  <span className="text-sm text-gray-600">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected event detail */}
          {selected ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Detalle</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Monitor className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900">{selected.techAsset?.asset?.name ?? selected.techAsset?.hostname}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[selected.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {selected.status}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${TYPE_COLOR[selected.type]}`}>
                    {selected.type}
                  </span>
                </div>
                <p className="text-gray-600">{selected.description}</p>
                {selected.scheduledDate && (
                  <p className="text-gray-500 text-xs">
                    📅 Programado: {new Date(selected.scheduledDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                )}
                {selected.executedDate && (
                  <p className="text-gray-500 text-xs">
                    ✅ Ejecutado: {new Date(selected.executedDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                )}
                {selected.technician && (
                  <p className="text-gray-500 text-xs">
                    👤 {selected.technician.firstName} {selected.technician.lastName}
                  </p>
                )}
                {selected.nextScheduled && (
                  <p className="text-xs font-medium text-indigo-600">
                    🔁 Próximo: {new Date(selected.nextScheduled).toLocaleDateString('es-CO', { day: '2-digit', month: 'long' })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center text-sm text-gray-400">
              Hacé clic en un evento del calendario para ver el detalle
            </div>
          )}

          {/* Upcoming */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Próximos programados</h3>
            {records
              .filter((m) => m.status === 'PROGRAMADO' && m.scheduledDate && new Date(m.scheduledDate) >= today)
              .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
              .slice(0, 5)
              .map((m) => (
                <div key={m.id}
                  onClick={() => setSelected(m)}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded px-1"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${TYPE_COLOR[m.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {m.techAsset?.asset?.name ?? m.techAsset?.hostname}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(m.scheduledDate!).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            {records.filter((m) => m.status === 'PROGRAMADO' && m.scheduledDate && new Date(m.scheduledDate) >= today).length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">Sin mantenimientos próximos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
