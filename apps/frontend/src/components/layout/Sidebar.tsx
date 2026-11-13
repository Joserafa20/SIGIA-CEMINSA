'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Pill,
  Monitor,
  Building2,
  Users,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Almacén',
    icon: Package,
    children: [
      { label: 'Activos', href: '/almacen/assets' },
      { label: 'Categorías', href: '/almacen/categories' },
      { label: 'Traslados', href: '/almacen/transfers' },
      { label: 'Movimientos', href: '/almacen/movements' },
    ],
  },
  {
    label: 'Farmacia',
    icon: Pill,
    children: [
      { label: 'Productos', href: '/farmacia/products' },
      { label: 'Ingreso stock', href: '/farmacia/stock/entry' },
      { label: 'Dispensar', href: '/farmacia/stock/dispense' },
    ],
  },
  {
    label: 'Sistemas',
    icon: Monitor,
    children: [
      { label: 'Equipos', href: '/sistemas/assets' },
      { label: 'Licencias', href: '/sistemas/licenses' },
      { label: 'Mantenimientos', href: '/sistemas/maintenance' },
      { label: 'Tickets', href: '/sistemas/tickets' },
    ],
  },
  { label: 'Sedes', href: '/sedes', icon: Building2 },
  { label: 'Usuarios', href: '/users', icon: Users },
  { label: 'Reportes', href: '/reportes', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(['Almacén']);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label],
    );
  };

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-primary">SIGIA</p>
          <p className="text-xs text-gray-500">CEMINSA</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV_ITEMS.map((item) => {
          if (item.href) {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          }

          const isOpen = openGroups.includes(item.label);
          const groupActive = item.children?.some((c) => pathname.startsWith(c.href));

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGroup(item.label)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  groupActive
                    ? 'font-medium text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
                />
              </button>
              {isOpen && (
                <div className="ml-7 border-l border-gray-100">
                  {item.children?.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center px-4 py-2 text-sm transition-colors',
                          childActive
                            ? 'font-medium text-primary'
                            : 'text-gray-500 hover:text-gray-900',
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
