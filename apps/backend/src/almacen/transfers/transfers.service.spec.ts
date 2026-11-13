import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransferStatus } from '@prisma/client';
import { TransfersService } from './transfers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

const mockPrisma = {
  transfer: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  asset: { findMany: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  movement: { createMany: jest.fn() },
  sede: { findUnique: jest.fn() },
  $transaction: jest.fn(),
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

const makeTransfer = (overrides: Partial<any> = {}) => ({
  id: 'transfer-1',
  originSedeId: 'sede-a',
  destinationSedeId: 'sede-b',
  status: TransferStatus.DESPACHADO,
  assets: [{ id: 'asset-1' }],
  ...overrides,
});

describe('TransfersService', () => {
  let service: TransfersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<TransfersService>(TransfersService);
  });

  describe('cancel', () => {
    it('throws NotFoundException when transfer not found', async () => {
      mockPrisma.transfer.findUnique.mockResolvedValue(null);
      await expect(service.cancel('non-existent', 'reason', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when transfer is already RECIBIDO', async () => {
      mockPrisma.transfer.findUnique.mockResolvedValue(
        makeTransfer({ status: TransferStatus.RECIBIDO }),
      );
      await expect(service.cancel('transfer-1', 'reason', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('cancels a DESPACHADO transfer', async () => {
      mockPrisma.transfer.findUnique.mockResolvedValue(makeTransfer({ status: TransferStatus.DESPACHADO }));
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          asset: { updateMany: jest.fn().mockResolvedValue({}) },
          transfer: {
            update: jest.fn().mockResolvedValue(makeTransfer({ status: TransferStatus.CANCELADO })),
          },
        };
        return fn(tx);
      });

      const result = await service.cancel('transfer-1', 'duplicate', 'user-1');
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('returns all transfers', async () => {
      mockPrisma.transfer.findMany.mockResolvedValue([makeTransfer()]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('filters by sedeId when provided', async () => {
      mockPrisma.transfer.findMany.mockResolvedValue([makeTransfer()]);

      const result = await service.findAll('sede-a');
      expect(result).toHaveLength(1);
      const call = mockPrisma.transfer.findMany.mock.calls[0][0];
      expect(call.where).toHaveProperty('OR');
    });
  });
});
