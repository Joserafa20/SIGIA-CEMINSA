'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

const schema = z.object({
  assetId: z.string().min(1, 'Selecciona un activo base'),
  sedeId: z.string().min(1, 'Selecciona una sede'),
  processor: z.string().optional(),
  ramGb: z.coerce.number().int().positive().optional().or(z.literal('')),
  storageGb: z.coerce.number().int().positive().optional().or(z.literal('')),
  storageType: z.string().optional(),
  operatingSystem: z.string().optional(),
  osVersion: z.string().optional(),
  macAddress: z.string().optional(),
  ipAddress: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  purchaseOrder: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewTechAssetPage() {
  const router = useRouter();
  const [sedes, setSedes] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    Promise.all([
      api.get('/v1/sedes'),
      api.get('/v1/almacen/assets?limit=200'),
    ]).then(([sds, ass]) => {
      setSedes(sds.data);
      // Only assets without a TIC record
      setAssets(ass.data.data.filter((a: any) => !a.techAsset));
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    try {
      // Strip empty strings
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
      );
      await api.post('/v1/sistemas/assets', payload);
      router.push('/sistemas/assets');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al registrar el equipo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Registrar equipo TIC</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <Field label="Activo base *" error={errors.assetId?.message}>
          <select {...register('assetId')} className={inputCls}>
            <option value="">Seleccionar activo del Almacén...</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}{a.plaque ? ` (${a.plaque})` : ''}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sede *" error={errors.sedeId?.message}>
          <select {...register('sedeId')} className={inputCls}>
            <option value="">Seleccionar sede...</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Procesador" error={errors.processor?.message}>
            <input {...register('processor')} className={inputCls} placeholder="Ej. Intel Core i5-12400" />
          </Field>
          <Field label="Sistema operativo" error={errors.operatingSystem?.message}>
            <input {...register('operatingSystem')} className={inputCls} placeholder="Ej. Windows 11 Pro" />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="RAM (GB)" error={errors.ramGb?.message}>
            <input {...register('ramGb')} type="number" min="1" className={inputCls} placeholder="8" />
          </Field>
          <Field label="Almacenamiento (GB)" error={errors.storageGb?.message}>
            <input {...register('storageGb')} type="number" min="1" className={inputCls} placeholder="512" />
          </Field>
          <Field label="Tipo almacenamiento" error={errors.storageType?.message}>
            <select {...register('storageType')} className={inputCls}>
              <option value="">—</option>
              <option>SSD</option>
              <option>HDD</option>
              <option>NVMe</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Dirección IP" error={errors.ipAddress?.message}>
            <input {...register('ipAddress')} className={inputCls} placeholder="192.168.1.100" />
          </Field>
          <Field label="MAC Address" error={errors.macAddress?.message}>
            <input {...register('macAddress')} className={inputCls} placeholder="AA:BB:CC:DD:EE:FF" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Garantía vence" error={errors.warrantyExpiry?.message}>
            <input {...register('warrantyExpiry')} type="date" className={inputCls} />
          </Field>
          <Field label="Orden de compra" error={errors.purchaseOrder?.message}>
            <input {...register('purchaseOrder')} className={inputCls} />
          </Field>
        </div>

        <Field label="Ubicación física" error={errors.location?.message}>
          <input {...register('location')} className={inputCls} placeholder="Ej. Oficina Sistemas, Piso 2" />
        </Field>

        <Field label="Notas" error={errors.notes?.message}>
          <textarea {...register('notes')} rows={2} className={inputCls} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Guardando...' : 'Registrar equipo'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
