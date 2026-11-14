'use client';

import { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import api from '@/lib/api';

interface Maintenance {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  completedAt: string | null;
  description: string | null;
  techAsset: { name: string } | null;
  technician: { name: string } | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PROGRAMADO: { label: 'Programado', color: 'bg-blue-100 text-blue-800' },
  EN_PROCESO: { label: 'En proceso', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETADO: { label: 'Completado', color: 'bg-green-100 text-green-800' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

const TYPE_LABEL: Record<string, string> = {
  PREVENTIVO: 'Preventivo',
  CORRECTIVO: 'Correctivo',
};

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/v1/sistemas/maintenance')
      .then((r) => setMaintenances(Array.isArray(r.data) ? r.data : r.data.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mantenimientos</h1>
          <p className="mt-1 text-sm text-gray-500">Mantenimientos de equipos TIC</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center text-red-400">
            <p className="text-sm">Error al cargar los mantenimientos</p>
          </div>
        ) : maintenances.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <Wrench className="h-10 w-10 mb-2" />
            <p className="text-sm">No hay mantenimientos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Equipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Técnico</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Programado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {maintenances.map((m) => {
                const st = STATUS_LABEL[m.status] ?? { label: m.status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.techAsset?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{TYPE_LABEL[m.type] ?? m.type}</td>
                    <td className="px-4 py-3 text-gray-600">{m.technician?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(m.scheduledAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
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
