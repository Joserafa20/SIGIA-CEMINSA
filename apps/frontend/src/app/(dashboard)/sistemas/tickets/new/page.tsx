'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

const schema = z.object({
  title: z.string().min(5, 'Mínimo 5 caracteres'),
  description: z.string().min(10, 'Describe el problema con más detalle'),
  priority: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']).default('MEDIA'),
  techAssetId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewTicketPage() {
  const router = useRouter();
  const [techAssets, setTechAssets] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIA' },
  });

  useEffect(() => {
    api.get('/v1/sistemas/assets?limit=200').then(({ data }) => setTechAssets(data.data));
  }, []);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    try {
      const payload = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '' && v !== undefined));
      await api.post('/v1/sistemas/tickets', payload);
      router.push('/sistemas/tickets');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al crear el ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo ticket</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <Field label="Título *" error={errors.title?.message}>
          <input {...register('title')} className={inputCls} placeholder="Ej. Computador no enciende en Sala de Espera" />
        </Field>

        <Field label="Descripción *" error={errors.description?.message}>
          <textarea {...register('description')} rows={4} className={inputCls} placeholder="Describe el problema, pasos para reproducirlo, etc." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Prioridad" error={errors.priority?.message}>
            <select {...register('priority')} className={inputCls}>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Crítica</option>
            </select>
          </Field>

          <Field label="Equipo relacionado" error={errors.techAssetId?.message}>
            <select {...register('techAssetId')} className={inputCls}>
              <option value="">Sin equipo específico</option>
              {techAssets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.asset?.name}{t.asset?.plaque ? ` (${t.asset.plaque})` : ''}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Enviando...' : 'Crear ticket'}
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
