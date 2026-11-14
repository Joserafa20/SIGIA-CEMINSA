import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

export async function seedAdminUser(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@sigia-ceminsa.local' },
    });
    if (existing) return;

    const passwordHash = await argon2.hash('Admin@SIGIA2025!');
    await prisma.user.create({
      data: {
        email: 'admin@sigia-ceminsa.local',
        passwordHash,
        firstName: 'Administrador',
        lastName: 'Sistema',
        isActive: true,
        roles: {
          create: [{ role: Role.SUPER_ADMIN }],
        },
      },
    });
    console.log('✓ Admin user seeded');
  } catch (err) {
    console.error('Seed bootstrap error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
