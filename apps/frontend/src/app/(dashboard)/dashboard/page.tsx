'use client';

import { useState, useEffect } from 'react';

interface AlmacenStats {
  totalAssets: number;
  byStatus: Record<string, number>;
  transfersPending: number;
}

interface FarmaciaStats {
  totalProducts: number;
  expiringLots: number;
  quarantineLots: number;
  lowStockProducts: number;
}

interface SistemasStats {
  totalTechAssets: number;
  openTickets: number;
  ticketsByPriority: Record<string, number>;
  scheduledMaintenances: number;
  expiringLicenses: number;
}

interface Summary {
  almacen: AlmacenStats;
  farmacia: FarmaciaStats;
  sistemas: SistemasStats;
  generatedAt: string;
}

function StatCard({
  label,
  value,
  sub,
  color = 'blue',
  alert = false,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
  alert?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <div
      className={`rounded-xl border p-5 ${alert ? 'bg-red-50 border-red-200' : colors[color] ?? colors.blue}`}
    >
      <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${alert ? 'text-red-700' : ''}`}>{value}</div>
      {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/dashboard')
      .then((r) => r.json())
      .then(setSummary)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-gray-400 text-sm">Cargando dashboard…</div>
      </div>
    );
  }

  if (!summary) {
    return <div className="p-8 text-red-500 text-sm">No se pudo cargar el dashboard</div>;
  }

  const { almacen, farmacia, sistemas } = summary;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Actualizado: {new Date(summary.generatedAt).toLocaleString('es-CO')}
          </p>
        </div>
        <a
          href="/api/v1/reports/dashboard/pdf"
          target="_blank"
          className="text-xs bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 font-medium"
        >
          Descargar informe PDF
        </a>
      </div>

      {/* Almacén */}
      <section>
        <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
          Almacén
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Activos totales" value={almacen.totalAssets} color="blue" />
          <StatCard
            label="En buen estado"
            value={almacen.byStatus?.BUENO ?? 0}
            color="green"
          />
          <StatCard
            label="En mantenimiento"
            value={almacen.byStatus?.EN_MANTENIMIENTO ?? 0}
            color="amber"
          />
          <StatCard
            label="Traslados en tránsito"
            value={almacen.transfersPending}
            color="purple"
            alert={almacen.transfersPending > 5}
          />
        </div>
      </section>

      {/* Farmacia */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
            Farmacia
          </h2>
          <a
            href="/api/v1/reports/farmacia/excel"
            className="text-xs text-green-700 hover:text-green-900 font-medium"
          >
            Exportar Excel →
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Productos activos" value={farmacia.totalProducts} color="green" />
          <StatCard
            label="Lotes por vencer (30d)"
            value={farmacia.expiringLots}
            color="amber"
            alert={farmacia.expiringLots > 0}
            sub="Requiere atención"
          />
          <StatCard
            label="En cuarentena"
            value={farmacia.quarantineLots}
            color="red"
            alert={farmacia.quarantineLots > 0}
          />
          <StatCard label="Prod. bajo mínimo" value={farmacia.lowStockProducts} color="amber" />
        </div>
      </section>

      {/* Sistemas */}
      <section>
        <h2 className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-3">
          Sistemas TIC
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Activos TIC" value={sistemas.totalTechAssets} color="purple" />
          <StatCard
            label="Tickets abiertos"
            value={sistemas.openTickets}
            color="amber"
            alert={sistemas.openTickets > 10}
          />
          <StatCard
            label="Mantenimientos prog."
            value={sistemas.scheduledMaintenances}
            color="blue"
          />
          <StatCard
            label="Licencias por vencer (90d)"
            value={sistemas.expiringLicenses}
            color="red"
            alert={sistemas.expiringLicenses > 0}
          />
        </div>

        {/* Tickets by priority */}
        {sistemas.openTickets > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Tickets por prioridad
            </h3>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(sistemas.ticketsByPriority).map(([priority, count]) => {
                const badgeColor: Record<string, string> = {
                  CRITICA: 'bg-red-100 text-red-700',
                  ALTA: 'bg-orange-100 text-orange-700',
                  MEDIA: 'bg-yellow-100 text-yellow-700',
                  BAJA: 'bg-gray-100 text-gray-600',
                };
                return (
                  <span
                    key={priority}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor[priority] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {priority}: {count}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Quick links */}
      <section className="bg-gray-50 rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Reportes disponibles
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Inventario Almacén', href: '/api/v1/reports/almacen/excel', ext: 'XLSX' },
            { label: 'Stock Farmacia', href: '/api/v1/reports/farmacia/excel', ext: 'XLSX' },
            { label: 'Informe ejecutivo', href: '/api/v1/reports/dashboard/pdf', ext: 'PDF' },
          ].map((r) => (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <span className="text-sm font-medium text-gray-700">{r.label}</span>
              <span className="text-xs font-semibold text-gray-400">{r.ext}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
