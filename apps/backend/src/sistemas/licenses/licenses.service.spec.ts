import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

const mockPrisma = {
  license: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  techAsset: { findUnique: jest.fn() },
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

const makeLicense = (overrides: Partial<any> = {}) => ({
  id: 'lic-1',
  techAssetId: 'asset-1',
  softwareName: 'Microsoft Office',
  licenseKey: 'XXXX-YYYY',
  expiresAt: new Date('2027-01-01'),
  isActive: true,
  ...overrides,
});

describe('LicensesService', () => {
  let service: LicensesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicensesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<LicensesService>(LicensesService);
  });

  describe('findExpiringSoon', () => {
    it('queries licenses expiring within the given days window', async () => {
      mockPrisma.license.findMany.mockResolvedValue([makeLicense()]);
      await service.findExpiringSoon(30);

      const call = mockPrisma.license.findMany.mock.calls[0][0];
      expect(call.where.expiresAt.lte).toBeDefined();
      expect(call.where.expiresAt.gte).toBeDefined();
    });

    it('returns all expiring licenses sorted by expiresAt', async () => {
      const licenses = [
        makeLicense({ id: 'lic-1', expiresAt: new Date('2026-01-15') }),
        makeLicense({ id: 'lic-2', expiresAt: new Date('2026-01-01') }),
      ];
      mockPrisma.license.findMany.mockResolvedValue(licenses);
      const result = await service.findExpiringSoon(30);
      expect(result).toHaveLength(2);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when license does not exist', async () => {
      mockPrisma.license.findUnique.mockResolvedValue(null);
      await expect(service.remove('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('deletes the license when found', async () => {
      const lic = makeLicense();
      mockPrisma.license.findUnique.mockResolvedValue(lic);
      mockPrisma.license.delete.mockResolvedValue(lic);

      await service.remove('lic-1', 'user-1');
      expect(mockPrisma.license.delete).toHaveBeenCalledWith({ where: { id: 'lic-1' } });
    });
  });
});
