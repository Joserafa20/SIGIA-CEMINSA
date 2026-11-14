'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Sede {
  id: string;
  name: string;
  municipality: string | null;
  department: string | null;
  address: string | null;
  isActive: boolean;
}

export default function SedesPage() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/v1/sedes')
      .then((r) => setSedes(Array.isArray(r.data) ? r.data : r.data.data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sedes</h1>
          <p className="mt-1 text-sm text-gray-500">Sedes de la institución</p>
        </div>
        <Link
          href="/sedes/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Nueva sede
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center text-red-400">
            <p className="text-sm">Error al cargar las sedes</p>
          </div>
        ) : sedes.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <Building2 className="h-10 w-10 mb-2" />
            <p className="text-sm">No hay sedes registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Municipio</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Departamento</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Dirección</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sedes.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.municipality ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.department ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.address ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {s.isActive ? 'Activa' : 'Inactiva'}
                    </span>
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
