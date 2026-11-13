import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LotStatus, StockMovementType } from '@prisma/client';
import { StockService } from './stock.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

const mockPrisma = {
  product: { findUnique: jest.fn() },
  productStock: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn(), findMany: jest.fn() },
  lot: { findMany: jest.fn(), update: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
  stockMovement: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  stockEntry: { create: jest.fn(), update: jest.fn() },
  sede: { findUnique: jest.fn() },
  $transaction: jest.fn(),
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

const makeProduct = (overrides = {}) => ({
  id: 'prod-1',
  activePrinciple: 'Acetaminofén',
  isActive: true,
  ...overrides,
});

const makeLot = (overrides = {}) => ({
  id: 'lot-1',
  lotNumber: 'LOT-001',
  productId: 'prod-1',
  quantity: 100,
  status: LotStatus.DISPONIBLE,
  expiresAt: new Date('2026-06-01'),
  ...overrides,
});

describe('StockService', () => {
  let service: StockService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<StockService>(StockService);
  });

  // ─── dispense ───────────────────────────────────────────────────

  describe('dispense', () => {
    const dispenseDto = {
      productId: 'prod-1',
      sedeId: 'sede-1',
      quantity: 50,
    };

    it('throws NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.dispense(dispenseDto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when product is inactive', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(makeProduct({ isActive: false }));
      await expect(service.dispense(dispenseDto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when stock is insufficient', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(makeProduct());
      mockPrisma.productStock.findUnique.mockResolvedValue({ quantity: 20 });

      await expect(service.dispense(dispenseDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when no available lots exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(makeProduct());
      mockPrisma.productStock.findUnique.mockResolvedValue({ quantity: 100 });
      mockPrisma.lot.findMany.mockResolvedValue([]);

      await expect(service.dispense(dispenseDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('consumes lots in FEFO order (soonest expiry first)', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(makeProduct());
      mockPrisma.productStock.findUnique.mockResolvedValue({ quantity: 200 });

      const earlyLot = makeLot({ id: 'lot-early', expiresAt: new Date('2025-03-01'), quantity: 30 });
      const lateLot = makeLot({ id: 'lot-late', expiresAt: new Date('2026-12-01'), quantity: 100 });
      // findMany already returns them in FEFO order (service calls DB with ORDER BY expiresAt ASC)
      mockPrisma.lot.findMany.mockResolvedValue([earlyLot, lateLot]);

      const updatedLots: Record<string, number> = {};
      const createdMovements: any[] = [];

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          lot: {
            update: jest.fn().mockImplementation(({ where, data }) => {
              updatedLots[where.id] = data.quantity;
              return Promise.resolve({ ...makeLot({ id: where.id }), quantity: data.quantity });
            }),
          },
          stockMovement: {
            create: jest.fn().mockImplementation(({ data }) => {
              createdMovements.push(data);
              return Promise.resolve({ id: 'mov-1', ...data });
            }),
          },
          productStock: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return fn(tx);
      });

      const result = await service.dispense({ ...dispenseDto, quantity: 50 }, 'user-1');

      // earlyLot should be fully consumed (30 from it), lateLot provides remaining 20
      expect(updatedLots['lot-early']).toBe(0);
      expect(updatedLots['lot-late']).toBe(80);
      expect(createdMovements).toHaveLength(2);
      expect(result.dispensed).toBe(50);
      expect(result.movements).toHaveLength(2);
      expect(result.movements[0].lotId).toBe('lot-early');
      expect(result.movements[0].consumed).toBe(30);
      expect(result.movements[1].lotId).toBe('lot-late');
      expect(result.movements[1].consumed).toBe(20);
    });

    it('marks lot as AGOTADO when quantity reaches zero', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(makeProduct());
      mockPrisma.productStock.findUnique.mockResolvedValue({ quantity: 50 });
      mockPrisma.lot.findMany.mockResolvedValue([makeLot({ quantity: 50 })]);

      let lotUpdateArg: any;
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          lot: {
            update: jest.fn().mockImplementation(({ where, data }) => {
              lotUpdateArg = { where, data };
              return Promise.resolve({});
            }),
          },
          stockMovement: { create: jest.fn().mockResolvedValue({}) },
          productStock: { update: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      await service.dispense({ ...dispenseDto, quantity: 50 }, 'user-1');
      expect(lotUpdateArg.data.status).toBe(LotStatus.AGOTADO);
      expect(lotUpdateArg.data.quantity).toBe(0);
    });

    it('leaves lot as DISPONIBLE when partial quantity remains', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(makeProduct());
      mockPrisma.productStock.findUnique.mockResolvedValue({ quantity: 100 });
      mockPrisma.lot.findMany.mockResolvedValue([makeLot({ quantity: 100 })]);

      let lotUpdateArg: any;
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          lot: {
            update: jest.fn().mockImplementation(({ where, data }) => {
              lotUpdateArg = { where, data };
              return Promise.resolve({});
            }),
          },
          stockMovement: { create: jest.fn().mockResolvedValue({}) },
          productStock: { update: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      await service.dispense({ ...dispenseDto, quantity: 60 }, 'user-1');
      expect(lotUpdateArg.data.status).toBe(LotStatus.DISPONIBLE);
      expect(lotUpdateArg.data.quantity).toBe(40);
    });

    it('records correct movement type SALIDA', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(makeProduct());
      mockPrisma.productStock.findUnique.mockResolvedValue({ quantity: 100 });
      mockPrisma.lot.findMany.mockResolvedValue([makeLot({ quantity: 100 })]);

      const movements: any[] = [];
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          lot: { update: jest.fn().mockResolvedValue({}) },
          stockMovement: {
            create: jest.fn().mockImplementation(({ data }) => {
              movements.push(data);
              return Promise.resolve({});
            }),
          },
          productStock: { update: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      await service.dispense(dispenseDto, 'user-1');
      expect(movements[0].movementType).toBe(StockMovementType.SALIDA);
    });

    it('calls audit.log after successful dispense', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(makeProduct());
      mockPrisma.productStock.findUnique.mockResolvedValue({ quantity: 100 });
      mockPrisma.lot.findMany.mockResolvedValue([makeLot({ quantity: 100 })]);
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          lot: { update: jest.fn().mockResolvedValue({}) },
          stockMovement: { create: jest.fn().mockResolvedValue({}) },
          productStock: { update: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      await service.dispense(dispenseDto, 'user-1');
      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DISPENSE', module: 'FARMACIA' }),
      );
    });
  });

  // ─── adjust ──────────────────────────────────────────────────────

  describe('adjust', () => {
    it('throws NotFoundException when lot not found', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(null);
      await expect(
        service.adjust({ productId: 'p', lotId: 'l', sedeId: 's', newQuantity: 10, reason: 'r', userId: 'u' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when lot belongs to a different product', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(makeLot({ productId: 'other-product' }));
      await expect(
        service.adjust({ productId: 'prod-1', lotId: 'lot-1', sedeId: 's', newQuantity: 10, reason: 'r', userId: 'u' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('uses AJUSTE_POSITIVO when newQuantity > current', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(makeLot({ quantity: 20 }));
      const movements: any[] = [];
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          lot: { update: jest.fn().mockResolvedValue({}) },
          stockMovement: { create: jest.fn().mockImplementation(({ data }) => { movements.push(data); return Promise.resolve({}); }) },
          productStock: { upsert: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      await service.adjust({ productId: 'prod-1', lotId: 'lot-1', sedeId: 's', newQuantity: 50, reason: 'conteo', userId: 'u' });
      expect(movements[0].movementType).toBe(StockMovementType.AJUSTE_POSITIVO);
      expect(movements[0].quantity).toBe(30); // |50 - 20|
    });

    it('uses AJUSTE_NEGATIVO when newQuantity < current', async () => {
      mockPrisma.lot.findUnique.mockResolvedValue(makeLot({ quantity: 80 }));
      const movements: any[] = [];
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          lot: { update: jest.fn().mockResolvedValue({}) },
          stockMovement: { create: jest.fn().mockImplementation(({ data }) => { movements.push(data); return Promise.resolve({}); }) },
          productStock: { upsert: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      await service.adjust({ productId: 'prod-1', lotId: 'lot-1', sedeId: 's', newQuantity: 50, reason: 'conteo', userId: 'u' });
      expect(movements[0].movementType).toBe(StockMovementType.AJUSTE_NEGATIVO);
      expect(movements[0].quantity).toBe(30);
    });
  });
});
