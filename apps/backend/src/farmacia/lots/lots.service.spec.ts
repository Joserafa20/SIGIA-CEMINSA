import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LotStatus } from '@prisma/client';
import { LotsService } from './lots.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

const mockPrisma = {
  lot: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  product: { findUnique: jest.fn() },
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

const makeLot = (overrides: Partial<any> = {}) => ({
  id: 'lot-1',
  lotNumber: 'LOT-001',
  productId: 'prod-1',
  quantity: 50,
  status: LotStatus.DISPONIBLE,
  expiresAt: new Date('2027-01-01'),
  ...overrides,
});

describe('LotsService', () => {
  let service: LotsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LotsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<LotsService>(LotsService);
  });

  describe('quarantine', () => {
    it('throws NotFoundException when lot not found', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(null);
      await expect(service.quarantine('lot-1', 'contaminated', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when lot is already in quarantine', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(makeLot({ status: LotStatus.CUARENTENA }));
      await expect(service.quarantine('lot-1', 'reason', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('transitions DISPONIBLE → CUARENTENA', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(makeLot());
      mockPrisma.lot.update.mockResolvedValue(makeLot({ status: LotStatus.CUARENTENA }));

      const result = await service.quarantine('lot-1', 'suspected contamination', 'user-1');
      const updateCall = mockPrisma.lot.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe(LotStatus.CUARENTENA);
    });
  });

  describe('releaseFromQuarantine', () => {
    it('throws BadRequestException when lot is not in quarantine', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(makeLot({ status: LotStatus.DISPONIBLE }));
      await expect(service.releaseFromQuarantine('lot-1', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('transitions CUARENTENA → DISPONIBLE', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(makeLot({ status: LotStatus.CUARENTENA }));
      mockPrisma.lot.update.mockResolvedValue(makeLot({ status: LotStatus.DISPONIBLE, quarantineReason: null }));

      await service.releaseFromQuarantine('lot-1', 'user-1');
      const updateCall = mockPrisma.lot.update.mock.calls[0][0];
      expect(updateCall.data.status).toBe(LotStatus.DISPONIBLE);
    });
  });

  describe('markExpiredLots', () => {
    it('calls updateMany with expiresAt < now and status DISPONIBLE', async () => {
      mockPrisma.lot.updateMany.mockResolvedValue({ count: 3 });
      const count = await service.markExpiredLots();

      const call = mockPrisma.lot.updateMany.mock.calls[0][0];
      expect(call.where.status).toBe(LotStatus.DISPONIBLE);
      expect(call.where.expiresAt.lt).toBeDefined();
      expect(call.data.status).toBe(LotStatus.VENCIDO);
      expect(count).toBe(3);
    });
  });
});
