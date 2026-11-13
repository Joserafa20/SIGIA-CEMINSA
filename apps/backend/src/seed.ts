import { PrismaClient } from '../../../packages/database/generated/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Sede principal
  const sede = await prisma.sede.upsert({
    where: { code: 'CEMINSA-CENTRAL' },
    update: {},
    create: {
      code: 'CEMINSA-CENTRAL',
      name: 'ESE CEMINSA — Sede Central',
      address: 'Calle Principal #1-23',
      municipality: 'Sabanalarga',
      department: 'Atlántico',
      isActive: true,
    },
  });
  console.log(`Sede: ${sede.name}`);

  // Usuario SUPER_ADMIN
  const passwordHash = await argon2.hash('Admin1234!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ceminsa.gov.co' },
    update: {},
    create: {
      email: 'admin@ceminsa.gov.co',
      passwordHash,
      firstName: 'Administrador',
      lastName: 'CEMINSA',
      isActive: true,
    },
  });
  console.log(`Usuario: ${admin.email}`);

  // Rol SUPER_ADMIN
  await prisma.userRole.upsert({
    where: {
      userId_role_module: {
        userId: admin.id,
        role: 'SUPER_ADMIN',
        module: null,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      role: 'SUPER_ADMIN',
      module: null,
    },
  });

  // Acceso a sede (un registro por módulo)
  for (const module of ['ALMACEN', 'FARMACIA', 'SISTEMAS'] as const) {
    await prisma.userSedeAccess.upsert({
      where: { userId_sedeId_module: { userId: admin.id, sedeId: sede.id, module } },
      update: {},
      create: { userId: admin.id, sedeId: sede.id, module },
    });
  }

  console.log('\n✅ Seed completado');
  console.log('   Email:    admin@ceminsa.gov.co');
  console.log('   Password: Admin1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
