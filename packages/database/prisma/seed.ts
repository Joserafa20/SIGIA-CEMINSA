import { PrismaClient, Role, Module } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SIGIA-CEMINSA database...');

  // Sedes institucionales
  const sedes = [
    { code: 'ADMIN', name: 'Sede Administrativa', address: 'Sabanalarga', municipality: 'Sabanalarga', department: 'Atlántico' },
    { code: 'PARAISO', name: 'Paraíso', municipality: 'Sabanalarga', department: 'Atlántico' },
    { code: 'CAMPOBOLIVAR', name: 'Campo Bolívar', municipality: 'Sabanalarga', department: 'Atlántico' },
    { code: 'CDV', name: 'CDV', municipality: 'Sabanalarga', department: 'Atlántico' },
    { code: 'CASCAJAL', name: 'Cascajal', municipality: 'Sabanalarga', department: 'Atlántico' },
    { code: 'ISABELLOEZ', name: 'Isabel López', municipality: 'Sabanalarga', department: 'Atlántico' },
    { code: 'MOLINEROS', name: 'Molineros', municipality: 'Sabanalarga', department: 'Atlántico' },
    { code: 'AGUADA', name: 'Aguada de Pablo', municipality: 'Sabanalarga', department: 'Atlántico' },
    { code: 'LAPENA', name: 'La Peña', municipality: 'Sabanalarga', department: 'Atlántico' },
    { code: 'COLOMBIA', name: 'Colombia', municipality: 'Sabanalarga', department: 'Atlántico' },
    { code: 'GALLEGO', name: 'Gallego', municipality: 'Sabanalarga', department: 'Atlántico' },
  ];

  for (const sede of sedes) {
    await prisma.sede.upsert({
      where: { code: sede.code },
      update: {},
      create: sede,
    });
  }
  console.log(`✓ ${sedes.length} sedes creadas`);

  // Categorías de activos (basadas en catálogo CEM-XXX del Excel)
  const categories = [
    { code: 'CEM-001', name: 'Terrenos y Lotes', assetType: 'TANGIBLE' as const },
    { code: 'CEM-002', name: 'Edificaciones e Infraestructura', assetType: 'TANGIBLE' as const },
    { code: 'CEM-003', name: 'Equipos Médicos', assetType: 'TANGIBLE' as const },
    { code: 'CEM-004', name: 'Mobiliario de Oficina', assetType: 'TANGIBLE' as const },
    { code: 'CEM-005', name: 'Equipos de Cómputo', assetType: 'TANGIBLE' as const },
    { code: 'CEM-006', name: 'Equipos de Comunicaciones', assetType: 'TANGIBLE' as const },
    { code: 'CEM-007', name: 'Vehículos', assetType: 'TANGIBLE' as const },
    { code: 'CEM-008', name: 'Herramientas y Accesorios', assetType: 'TANGIBLE' as const },
    { code: 'CEM-009', name: 'Equipos de Laboratorio', assetType: 'TANGIBLE' as const },
    { code: 'CEM-010', name: 'Software y Licencias', assetType: 'INTANGIBLE' as const },
  ];

  for (const cat of categories) {
    await prisma.assetCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
  }
  console.log(`✓ ${categories.length} categorías de activos creadas`);

  // Usuario administrador (datos de prueba — NO usar en producción)
  const adminPassword = await argon2.hash('Admin@SIGIA2025!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sigia-ceminsa.local' },
    update: {},
    create: {
      email: 'admin@sigia-ceminsa.local',
      passwordHash: adminPassword,
      firstName: 'Administrador',
      lastName: 'Sistema',
      roles: {
        create: [{ role: Role.SUPER_ADMIN }],
      },
    },
  });
  console.log(`✓ Usuario admin creado: ${admin.email}`);

  // Usuarios de prueba por módulo
  const testUsers = [
    {
      email: 'almacenista@sigia-ceminsa.local',
      firstName: 'Almacenista',
      lastName: 'Prueba',
      password: 'Almacen@2025!',
      role: Role.ALMACENISTA,
      module: Module.ALMACEN,
    },
    {
      email: 'farmacia@sigia-ceminsa.local',
      firstName: 'Regente',
      lastName: 'Prueba',
      password: 'Farmacia@2025!',
      role: Role.REGENTE_FARMACIA,
      module: Module.FARMACIA,
    },
    {
      email: 'sistemas@sigia-ceminsa.local',
      firstName: 'Tecnico',
      lastName: 'Prueba',
      password: 'Sistemas@2025!',
      role: Role.TECNICO_SISTEMAS,
      module: Module.SISTEMAS,
    },
    {
      email: 'solicitante@sigia-ceminsa.local',
      firstName: 'Solicitante',
      lastName: 'Prueba',
      password: 'Solicita@2025!',
      role: Role.SOLICITANTE,
      module: Module.ALMACEN,
    },
  ];

  for (const u of testUsers) {
    const hash = await argon2.hash(u.password);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash: hash,
        firstName: u.firstName,
        lastName: u.lastName,
        roles: {
          create: [{ role: u.role, module: u.module }],
        },
      },
    });
  }
  console.log(`✓ ${testUsers.length} usuarios de prueba creados`);

  console.log('\nSeed completado. IMPORTANTE: Cambiar contraseñas en producción.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
