'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lot {
  id: string;
  lotNumber: string;
  quantity: number;
  status: string;
  expiresAt?: string;
  quarantineReason?: string;
}

interface StockBySede {
  quantity: number;
  sede: { id: string; name: string };
}

interface Product {
  id: string;
  code: string;
  activePrinciple: string;
  commercialName?: string;
  pharmaceuticalForm?: string;
  presentation?: string;
  concentration?: string;
  category: string;
  invima?: string;
  requiresLot: boolean;
  requiresColdChain: boolean;
  isControlled: boolean;
  isComodato: boolean;
  minimumStock?: number;
  isActive: boolean;
  lots?: Lot[];
  productStock?: StockBySede[];
}

const LOT_STATUS_BADGE: Record<string, string> = {
  DISPONIBLE: 'bg-green-100 text-green-700',
  CUARENTENA: 'bg-yellow-100 text-yellow-700',
  VENCIDO: 'bg-red-100 text-red-700',
  AGOTADO: 'bg-gray-100 text-gray-500',
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/farmacia/products/${id}`)
      .then((r) => r.json())
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-gray-400">Cargando…</div>;
  if (!product) return <div className="p-8 text-red-500">Producto no encontrado</div>;

  const totalStock = product.productStock?.reduce((acc, s) => acc + Number(s.quantity), 0) ?? 0;
  const belowMin = product.minimumStock != null && totalStock < product.minimumStock;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">←</button>
        <div>
          <div className="text-xs text-gray-400 font-mono">{product.code}</div>
          <h1 className="text-2xl font-bold text-gray-900">{product.activePrinciple}</h1>
          {product.commercialName && (
            <div className="text-sm text-gray-500">{product.commercialName}</div>
          )}
        </div>
        <div className="ml-auto flex gap-2">
          {product.isControlled && (
            <span className="px-2 py-1 rounded text-xs bg-red-50 text-red-600 font-medium">Controlado</span>
          )}
          {product.requiresColdChain && (
            <span className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-600 font-medium">Cadena frío</span>
          )}
          {!product.isActive && (
            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">Inactivo</span>
          )}
        </div>
      </div>

      {/* Specs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Información general</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            ['Forma farmacéutica', product.pharmaceuticalForm],
            ['Presentación', product.presentation],
            ['Concentración', product.concentration],
            ['Categoría', product.category],
            ['INVIMA', product.invima],
            ['Stock mínimo', product.minimumStock],
          ].filter(([, v]) => v != null).map(([label, value]) => (
            <div key={String(label)}>
              <div className="text-xs text-gray-400">{label}</div>
              <div className="font-medium text-gray-800">{String(value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock by sede */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Stock por sede</h2>
          <span className={`text-sm font-semibold ${belowMin ? 'text-red-600' : 'text-green-600'}`}>
            Total: {totalStock} {belowMin ? '⚠ bajo mínimo' : ''}
          </span>
        </div>
        {(product.productStock?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-400">Sin stock registrado</p>
        ) : (
          <div className="space-y-2">
            {product.productStock?.map((s) => (
              <div key={s.sede.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{s.sede.name}</span>
                <span className="font-semibold text-gray-900">{Number(s.quantity)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/farmacia/stock/entry?productId=${product.id}`}
            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
          >
            + Ingreso de stock
          </Link>
          <Link
            href={`/farmacia/stock/dispense?productId=${product.id}`}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            Dispensar
          </Link>
        </div>
      </div>

      {/* Lots */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Lotes</h2>
        {(product.lots?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-400">Sin lotes registrados</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left pb-2 font-semibold text-gray-500">Lote</th>
                <th className="text-left pb-2 font-semibold text-gray-500">Vence</th>
                <th className="text-left pb-2 font-semibold text-gray-500">Estado</th>
                <th className="text-right pb-2 font-semibold text-gray-500">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {product.lots?.map((lot) => (
                <tr key={lot.id}>
                  <td className="py-2 font-mono text-gray-700">{lot.lotNumber}</td>
                  <td className="py-2 text-gray-600">
                    {lot.expiresAt
                      ? new Date(lot.expiresAt).toLocaleDateString('es-CO')
                      : '—'}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LOT_STATUS_BADGE[lot.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {lot.status}
                    </span>
                  </td>
                  <td className="py-2 text-right font-semibold text-gray-800">{Number(lot.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
