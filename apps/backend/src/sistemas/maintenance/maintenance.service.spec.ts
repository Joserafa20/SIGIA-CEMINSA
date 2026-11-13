import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

const mockPrisma = {
  maintenance: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  techAsset: { findUnique: jest.fn() },
  user: { findUnique: jest.fn() },
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

const makeMaintenance = (overrides: Partial<any> = {}) => ({
  id: 'maint-1',
  techAssetId: 'asset-1',
  status: 'PROGRAMADO',
  maintenanceType: 'PREVENTIVO',
  scheduledDate: new Date('2026-02-01'),
  technicianId: 'tech-1',
  ...overrides,
});

describe('MaintenanceService', () => {
  let service: MaintenanceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<MaintenanceService>(MaintenanceService);
  });

  describe('update', () => {
    it('throws NotFoundException when maintenance record not found', async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue(null);
      await expect(service.update('non-existent', {}, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('rejects an invalid status value', async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue(makeMaintenance());
      await expect(
        service.update('maint-1', { status: 'INVALID_STATUS' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows PROGRAMADO → EN_EJECUCION', async () => {
      const maint = makeMaintenance({ status: 'PROGRAMADO' });
      mockPrisma.maintenance.findUnique.mockResolvedValue(maint);
      mockPrisma.maintenance.update.mockResolvedValue({ ...maint, status: 'EN_EJECUCION' });

      const result = await service.update('maint-1', { status: 'EN_EJECUCION' }, 'user-1');
      expect(result.status).toBe('EN_EJECUCION');
    });

    it('allows EN_EJECUCION → COMPLETADO', async () => {
      const maint = makeMaintenance({ status: 'EN_EJECUCION' });
      mockPrisma.maintenance.findUnique.mockResolvedValue(maint);
      mockPrisma.maintenance.update.mockResolvedValue({ ...maint, status: 'COMPLETADO' });

      const result = await service.update('maint-1', { status: 'COMPLETADO' }, 'user-1');
      expect(result.status).toBe('COMPLETADO');
    });

    it('allows updating fields without changing status', async () => {
      const maint = makeMaintenance({ status: 'EN_EJECUCION' });
      mockPrisma.maintenance.findUnique.mockResolvedValue(maint);
      mockPrisma.maintenance.update.mockResolvedValue({ ...maint, findings: 'found issue' });

      const result = await service.update('maint-1', { findings: 'found issue' }, 'user-1');
      expect(result.findings).toBe('found issue');
    });
  });
});
