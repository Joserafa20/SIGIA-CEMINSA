'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const schema = z.object({
  code: z.string().min(1),
  activePrinciple: z.string().min(1),
  commercialName: z.string().optional(),
  pharmaceuticalForm: z.string().optional(),
  presentation: z.string().optional(),
  concentration: z.string().optional(),
  category: z.enum(['MEDICAMENTO', 'DISPOSITIVO_MEDICO', 'REACTIVO', 'INSUMO', 'COMODATO']),
  invima: z.string().optional(),
  requiresLot: z.boolean().default(true),
  requiresColdChain: z.boolean().default(false),
  isControlled: z.boolean().default(false),
  isComodato: z.boolean().default(false),
  minimumStock: z.coerce.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'MEDICAMENTO',
      requiresLot: true,
      requiresColdChain: false,
      isControlled: false,
      isComodato: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch('/api/v1/farmacia/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const product = await res.json();
      router.push(`/farmacia/products/${product.id}`);
    }
  };

  const field = (label: string, name: keyof FormValues, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...register(name)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {errors[name] && (
        <p className="text-xs text-red-500 mt-1">{String(errors[name]?.message)}</p>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">←</button>
        <h1 className="text-xl font-bold text-gray-900">Nuevo producto</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-2 gap-4">
          {field('Código *', 'code', 'MED-001')}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select
              {...register('category')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MEDICAMENTO">Medicamento</option>
              <option value="DISPOSITIVO_MEDICO">Dispositivo médico</option>
              <option value="REACTIVO">Reactivo</option>
              <option value="INSUMO">Insumo</option>
              <option value="COMODATO">Comodato</option>
            </select>
          </div>
        </div>

        {field('Principio activo *', 'activePrinciple', 'ej. Acetaminofén')}
        {field('Nombre comercial', 'commercialName', 'ej. Tylenol')}

        <div className="grid grid-cols-2 gap-4">
          {field('Forma farmacéutica', 'pharmaceuticalForm', 'ej. Tableta')}
          {field('Concentración', 'concentration', 'ej. 500mg')}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {field('Presentación', 'presentation', 'ej. Caja x 100 tab.')}
          {field('Registro INVIMA', 'invima', 'INVIMA 2023M-00000')}
        </div>

        {field('Stock mínimo', 'minimumStock', '10')}

        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            ['requiresLot', 'Requiere número de lote'],
            ['requiresColdChain', 'Requiere cadena de frío'],
            ['isControlled', 'Medicamento controlado'],
            ['isComodato', 'Es comodato'],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                {...register(name as keyof FormValues)}
                className="rounded border-gray-300"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {isSubmitting ? 'Guardando…' : 'Crear producto'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-50 text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
