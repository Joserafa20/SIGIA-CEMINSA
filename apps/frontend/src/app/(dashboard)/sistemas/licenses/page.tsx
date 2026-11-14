'use client';

import { useEffect, useState } from 'react';
import { Key } from 'lucide-react';
import api from '@/lib/api';

interface License {
  id: string;
  productName: string;
  vendor: string | null;
  expiresAt: string | null;
  seats: number | null;
  techAsset: {
    asset: { name: string; plaque: string | null } | null;
  } | null;
}

function getLicenseStatus(expiresAt: string | null): { label: string; color: string } {
  if (!expiresAt) return { label: 'Perpetua', color: 'bg-blue-100 text-blue-800' };
  const now = new Date();
  const exp = new Date(expiresAt);
  const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: 'Expirada', color: 'bg-red-100 text-red-800' };
  if (daysLeft <= 30) return { label: 'Por vencer', color: 'bg-yellow-100 text-yellow-800' };
  return { label: 'Activa', color: 'bg-green-100 text-green-800' };
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/v1/sistemas/licenses')
      .then((r) => setLicenses(Array.isArray(r.data) ? r.data : r.data.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Licencias</h1>
        <p className="mt-1 text-sm text-gray-500">Licencias de software</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center text-red-400">
            <p className="text-sm">Error al cargar las licencias</p>
          </div>
        ) : licenses.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <Key className="h-10 w-10 mb-2" />
            <p className="text-sm">No hay licencias registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Proveedor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Equipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Puestos</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Vence</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {licenses.map((l) => {
                const st = getLicenseStatus(l.expiresAt);
                return (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{l.productName}</td>
                    <td className="px-4 py-3 text-gray-600">{l.vendor ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{l.techAsset?.asset?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{l.seats ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString('es-CO') : 'Perpetua'}
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
