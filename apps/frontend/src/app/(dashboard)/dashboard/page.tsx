import { Package, ArrowRightLeft, Pill, Monitor } from 'lucide-react';

const STAT_CARDS = [
  { label: 'Activos registrados', value: '—', icon: Package, color: 'text-blue-600 bg-blue-50' },
  { label: 'Traslados en curso', value: '—', icon: ArrowRightLeft, color: 'text-amber-600 bg-amber-50' },
  { label: 'Productos farmacia', value: '—', icon: Pill, color: 'text-green-600 bg-green-50' },
  { label: 'Equipos TIC', value: '—', icon: Monitor, color: 'text-purple-600 bg-purple-50' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sistema Integral de Gestión de Inventarios y Activos — ESE CEMINSA
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-lg p-2 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">Módulos activos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Fase 3 completada — Módulo Almacén disponible. Farmacia y Sistemas próximamente.
        </p>
      </div>
    </div>
  );
}
