'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  sedeId: z.string().min(1, 'Selecciona una sede'),
  plaque: z.string().optional(),
  institutionalCode: z.string().optional(),
  serial: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  initialValue: z.coerce.number().min(0).optional(),
  acquisitionDate: z.string().optional(),
  observations: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewAssetPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    Promise.all([
      api.get('/v1/almacen/categories'),
      api.get('/v1/sedes'),
    ]).then(([cats, sds]) => {
      setCategories(cats.data);
      setSedes(sds.data);
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/v1/almacen/assets', data);
      router.push('/almacen/assets');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al registrar el activo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Registrar activo</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {/* Name */}
        <Field label="Nombre *" error={errors.name?.message}>
          <input {...register('name')} className={inputCls} placeholder="Ej. Computador portátil HP" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría *" error={errors.categoryId?.message}>
            <select {...register('categoryId')} className={inputCls}>
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Sede *" error={errors.sedeId?.message}>
            <select {...register('sedeId')} className={inputCls}>
              <option value="">Seleccionar...</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Placa" error={errors.plaque?.message}>
            <input {...register('plaque')} className={inputCls} placeholder="Ej. CEM-2024-001" />
          </Field>
          <Field label="Código institucional" error={errors.institutionalCode?.message}>
            <input {...register('institutionalCode')} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Serial" error={errors.serial?.message}>
            <input {...register('serial')} className={inputCls} />
          </Field>
          <Field label="Marca" error={errors.brand?.message}>
            <input {...register('brand')} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Modelo" error={errors.model?.message}>
            <input {...register('model')} className={inputCls} />
          </Field>
          <Field label="Valor inicial ($)" error={errors.initialValue?.message}>
            <input {...register('initialValue')} type="number" min="0" className={inputCls} placeholder="0" />
          </Field>
        </div>

        <Field label="Fecha de adquisición" error={errors.acquisitionDate?.message}>
          <input {...register('acquisitionDate')} type="date" className={inputCls} />
        </Field>

        <Field label="Observaciones" error={errors.observations?.message}>
          <textarea {...register('observations')} rows={3} className={inputCls} />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Registrar activo'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
