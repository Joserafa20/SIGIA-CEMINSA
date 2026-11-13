'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import api from '@/lib/api';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  EXCELENTE: { label: 'Excelente', color: 'bg-green-100 text-green-800' },
  BUENO: { label: 'Bueno', color: 'bg-blue-100 text-blue-800' },
  REGULAR: { label: 'Regular', color: 'bg-yellow-100 text-yellow-800' },
  MALO: { label: 'Malo', color: 'bg-red-100 text-red-800' },
  BAJA: { label: 'Baja', color: 'bg-gray-100 text-gray-600' },
  EN_TRANSITO: { label: 'En tránsito', color: 'bg-purple-100 text-purple-800' },
};

const MOVEMENT_LABEL: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA_AUTORIZADA: 'Salida autorizada',
  SALIDA_BAJA: 'Salida por baja',
  TRASLADO_SALIDA: 'Traslado (salida)',
  TRASLADO_ENTRADA: 'Traslado (entrada)',
  AJUSTE_POSITIVO: 'Ajuste positivo',
  AJUSTE_NEGATIVO: 'Ajuste negativo',
  MANTENIMIENTO_SALIDA: 'Mantenimiento',
  MANTENIMIENTO_RETORNO: 'Retorno mantenimiento',
};

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/almacen/assets/${id}`)
      .then(({ data }) => setAsset(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!asset) return <p className="text-sm text-gray-500">Activo no encontrado.</p>;

  const status = STATUS_LABEL[asset.status] ?? { label: asset.status, color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {asset.category?.name} · {asset.sede?.name}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Placa', value: asset.plaque },
          { label: 'Código institucional', value: asset.institutionalCode },
          { label: 'Serial', value: asset.serial },
          { label: 'Marca', value: asset.brand },
          { label: 'Modelo', value: asset.model },
          { label: 'Valor actual', value: asset.currentValue ? `$ ${Number(asset.currentValue).toLocaleString('es-CO')}` : null },
          { label: 'Valor inicial', value: asset.initialValue ? `$ ${Number(asset.initialValue).toLocaleString('es-CO')}` : null },
          { label: 'Fecha adquisición', value: asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString('es-CO') : null },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-gray-100 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Recent movements */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <Clock className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Últimos movimientos</h2>
        </div>
        {asset.movements?.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">Sin movimientos registrados</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {asset.movements?.map((mov: any) => (
              <li key={mov.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {MOVEMENT_LABEL[mov.movementType] ?? mov.movementType}
                  </p>
                  <p className="text-xs text-gray-400">
                    {mov.requestedBy
                      ? `${mov.requestedBy.firstName} ${mov.requestedBy.lastName}`
                      : ''}
                    {mov.documentRef ? ` · ${mov.documentRef}` : ''}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(mov.createdAt).toLocaleDateString('es-CO', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
