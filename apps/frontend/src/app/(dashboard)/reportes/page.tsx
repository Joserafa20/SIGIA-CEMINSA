'use client';

interface Report {
  title: string;
  description: string;
  href: string;
  format: string;
  roles: string;
  color: string;
}

const REPORTS: Report[] = [
  {
    title: 'Inventario Almacén',
    description: 'Todos los activos institucionales con estado, sede y valor actual.',
    href: '/api/v1/reports/almacen/excel',
    format: 'XLSX',
    roles: 'Almacenista, Control Interno, Contabilidad',
    color: 'blue',
  },
  {
    title: 'Stock Farmacia',
    description: 'Stock por producto con alerta de mínimos + hoja de lotes por vencer (60 días).',
    href: '/api/v1/reports/farmacia/excel',
    format: 'XLSX',
    roles: 'Regente Farmacia, Control Interno',
    color: 'green',
  },
  {
    title: 'Informe ejecutivo',
    description: 'Resumen de gestión de los tres módulos con KPIs clave para dirección.',
    href: '/api/v1/reports/dashboard/pdf',
    format: 'PDF',
    roles: 'Dirección, Control Interno, Admin TIC',
    color: 'gray',
  },
];

const colorMap: Record<string, { card: string; badge: string; btn: string }> = {
  blue: {
    card: 'border-blue-100 hover:border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  green: {
    card: 'border-green-100 hover:border-green-200',
    badge: 'bg-green-100 text-green-700',
    btn: 'bg-green-600 hover:bg-green-700 text-white',
  },
  gray: {
    card: 'border-gray-100 hover:border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    btn: 'bg-gray-800 hover:bg-gray-900 text-white',
  },
};

export default function ReportesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-400 mt-1">
          Exportaciones generadas en tiempo real desde la base de datos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => {
          const c = colorMap[report.color] ?? colorMap.gray;
          return (
            <div
              key={report.href}
              className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 transition-all ${c.card}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-gray-900">{report.title}</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.badge}`}>
                  {report.format}
                </span>
              </div>
              <p className="text-sm text-gray-500 flex-1">{report.description}</p>
              <div className="text-xs text-gray-400">
                <span className="font-medium">Acceso:</span> {report.roles}
              </div>
              <a
                href={report.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-medium px-4 py-2 rounded-lg text-center transition-colors ${c.btn}`}
              >
                Descargar {report.format}
              </a>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
        <strong>Nota de seguridad:</strong> Estos reportes contienen información institucional
        sensible. Gestionalos con cuidado y no los distribuyas por canales no seguros.
      </div>
    </div>
  );
}
