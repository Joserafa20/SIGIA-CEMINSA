import { PrismaClient, AssetType } from '../../../packages/database/generated/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  // Tangible
  { code: 'CEM-001', name: 'Terrenos y Lotes', assetType: AssetType.TANGIBLE, description: 'Terrenos y lotes sin construir' },
  { code: 'CEM-002', name: 'Edificaciones e Infraestructura', assetType: AssetType.TANGIBLE, description: 'Sedes e infraestructura física' },
  { code: 'CEM-003', name: 'Equipos Médicos', assetType: AssetType.TANGIBLE, description: 'Equipos de diagnóstico y atención médica' },
  { code: 'CEM-018', name: 'Mobiliario de Oficina', assetType: AssetType.TANGIBLE, description: 'Muebles y enseres de oficina' },
  { code: 'CEM-031', name: 'Maquinaria (plantas eléctricas)', assetType: AssetType.TANGIBLE, description: 'Plantas eléctricas y otro tipo de maquinaria' },
  { code: 'CEM-033', name: 'Vehículos', assetType: AssetType.TANGIBLE, description: 'Ambulancias y vehículos institucionales' },
  { code: 'CEM-034', name: 'Equipos Informáticos', assetType: AssetType.TANGIBLE, description: 'Computadores, impresoras, servidores y equipos de cómputo' },
  { code: 'CEM-039', name: 'Herramientas y Equipos Menores', assetType: AssetType.TANGIBLE, description: 'Herramientas, unidades odontológicas, camillas y equipos menores' },
  // Intangible
  { code: 'CEM-061', name: 'Licencias de Software', assetType: AssetType.INTANGIBLE, description: 'Licencias de software adquiridas' },
  { code: 'CEM-062', name: 'Patentes y Marcas', assetType: AssetType.INTANGIBLE, description: 'Patentes, marcas registradas' },
  { code: 'CEM-063', name: 'Derechos de Autor', assetType: AssetType.INTANGIBLE, description: 'Derechos de autor y propiedad intelectual' },
  { code: 'CEM-064', name: 'Sistemas Informáticos', assetType: AssetType.INTANGIBLE, description: 'Sistemas de información desarrollados internamente' },
  // Bienes de Consumo
  { code: 'CEM-065', name: 'Medicamentos', assetType: AssetType.BIENES_CONSUMO, description: 'Medicamentos e insumos farmacéuticos' },
  { code: 'CEM-066', name: 'Materiales de Oficina', assetType: AssetType.BIENES_CONSUMO, description: 'Papelería y materiales de oficina' },
  { code: 'CEM-067', name: 'Insumos Médicos', assetType: AssetType.BIENES_CONSUMO, description: 'Insumos y materiales de uso médico' },
  { code: 'CEM-068', name: 'Ropa de Cama y Sábanas', assetType: AssetType.BIENES_CONSUMO, description: 'Lencería y ropa de cama hospitalaria' },
  { code: 'CEM-069', name: 'Material de Limpieza', assetType: AssetType.BIENES_CONSUMO, description: 'Productos y materiales de aseo y limpieza' },
  { code: 'CEM-070', name: 'Alimentos y Bebidas', assetType: AssetType.BIENES_CONSUMO, description: 'Alimentos y bebidas (si aplica)' },
  { code: 'CEM-071', name: 'Equipos de Protección Personal (EPP)', assetType: AssetType.BIENES_CONSUMO, description: 'Elementos de protección personal' },
  { code: 'CEM-072', name: 'Otros equipos menores', assetType: AssetType.BIENES_CONSUMO, description: 'Otros equipos y bienes de consumo menor' },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of CATEGORIES) {
    await prisma.assetCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, assetType: cat.assetType, description: cat.description },
      create: cat,
    });
    console.log(`  ✓ ${cat.code} — ${cat.name}`);
  }
  console.log(`Done. ${CATEGORIES.length} categories upserted.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
