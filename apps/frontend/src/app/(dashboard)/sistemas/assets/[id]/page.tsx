'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Cpu, Key, Wrench, Ticket } from 'lucide-react';
import api from '@/lib/api';

const TICKET_STATUS_COLOR: Record<string, string> = {
  ABIERTO: 'bg-blue-100 text-blue-800',
  EN_PROGRESO: 'bg-yellow-100 text-yellow-800',
  RESUELTO: 'bg-green-100 text-green-800',
  CERRADO: 'bg-gray-100 text-gray-600',
  CANCELADO: 'bg-red-100 text-red-700',
};

const PRIORITY_COLOR: Record<string, string> = {
  BAJA: 'bg-gray-100 text-gray-600',
  MEDIA: 'bg-blue-100 text-blue-700',
  ALTA: 'bg-orange-100 text-orange-700',
  CRITICA: 'bg-red-100 text-red-700',
};

export default function TechAssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tech, setTech] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/sistemas/assets/${id}`)
      .then(({ data }) => setTech(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!tech) return <p className="text-sm text-gray-500">Equipo no encontrado.</p>;

  const specs = [
    { label: 'Procesador', value: tech.processor },
    { label: 'RAM', value: tech.ramGb ? `${tech.ramGb} GB` : null },
    { label: 'Almacenamiento', value: tech.storageGb ? `${tech.storageGb} GB ${tech.storageType ?? ''}` : null },
    { label: 'Sistema operativo', value: tech.operatingSystem ? `${tech.operatingSystem} ${tech.osVersion ?? ''}` : null },
    { label: 'Dirección IP', value: tech.ipAddress },
    { label: 'MAC Address', value: tech.macAddress },
    { label: 'Código QR', value: tech.qrCode },
    { label: 'Orden de compra', value: tech.purchaseOrder },
    { label: 'Garantía vence', value: tech.warrantyExpiry ? new Date(tech.warrantyExpiry).toLocaleDateString('es-CO') : null },
    { label: 'Ubicación física', value: tech.location },
    { label: 'Asignado a', value: tech.assignedTo ? `${tech.assignedTo.firstName} ${tech.assignedTo.lastName}` : null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{tech.asset.name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {tech.asset.category?.name} · {tech.sede?.name}
            {tech.asset.plaque ? ` · Placa: ${tech.asset.plaque}` : ''}
          </p>
        </div>
        <Cpu className="h-8 w-8 text-primary/40" />
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {specs.filter((s) => s.value).map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-gray-100 bg-white p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900 break-all">{value}</p>
          </div>
        ))}
      </div>

      {/* Licenses */}
      <Section icon={Key} title="Licencias" count={tech.licenses?.length}>
        {tech.licenses?.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-400">Sin licencias registradas</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {tech.licenses?.map((lic: any) => (
              <li key={lic.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{lic.productName}</p>
                  <p className="text-xs text-gray-400">{lic.vendor}{lic.seats ? ` · ${lic.seats} seats` : ''}</p>
                </div>
                {lic.expiresAt && (
                  <p className="text-xs text-gray-400">
                    Vence {new Date(lic.expiresAt).toLocaleDateString('es-CO')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Maintenances */}
      <Section icon={Wrench} title="Mantenimientos recientes" count={tech.maintenances?.length}>
        {tech.maintenances?.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-400">Sin mantenimientos registrados</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {tech.maintenances?.map((m: any) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.type} — {m.description}</p>
                  <p className="text-xs text-gray-400">
                    {m.technician ? `${m.technician.firstName} ${m.technician.lastName}` : ''}
                    {m.status ? ` · ${m.status}` : ''}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(m.createdAt).toLocaleDateString('es-CO')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Tickets */}
      <Section icon={TicketIcon} title="Tickets recientes" count={tech.tickets?.length}>
        {tech.tickets?.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-400">Sin tickets registrados</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {tech.tickets?.map((t: any) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-400">
                    {t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLOR[t.priority] ?? ''}`}>
                    {t.priority}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TICKET_STATUS_COLOR[t.status] ?? ''}`}>
                    {t.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <Icon className="h-4 w-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {count !== undefined && (
          <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}
