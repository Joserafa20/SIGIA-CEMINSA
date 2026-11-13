import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssetStatus, LotStatus, TicketStatus } from '@prisma/client';

const mockPrisma = {
  asset: { count: jest.fn(), groupBy: jest.fn() },
  movement: { findMany: jest.fn(), groupBy: jest.fn() },
  transfer: { count: jest.fn() },
  product: { count: jest.fn() },
  lot: { count: jest.fn(), findMany: jest.fn() },
  stockMovement: { findMany: jest.fn() },
  techAsset: { count: jest.fn() },
  ticket: { count: jest.fn(), groupBy: jest.fn() },
  maintenance: { count: jest.fn() },
  license: { count: jest.fn() },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<DashboardService>(DashboardService);
  });

  describe('getAlmacenStats', () => {
    it('returns total assets excluding BAJA', async () => {
      mockPrisma.asset.count.mockResolvedValue(42);
      mockPrisma.asset.groupBy.mockResolvedValue([
        { status: AssetStatus.BUENO, _count: { id: 30 } },
        { status: AssetStatus.EN_MANTENIMIENTO, _count: { id: 12 } },
      ]);
      mockPrisma.movement.findMany.mockResolvedValue([]);
      mockPrisma.transfer.count.mockResolvedValue(3);

      const result = await service.getAlmacenStats();

      expect(mockPrisma.asset.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: { not: AssetStatus.BAJA } },
        }),
      );
      expect(result.totalAssets).toBe(42);
      expect(result.byStatus[AssetStatus.BUENO]).toBe(30);
      expect(result.transfersPending).toBe(3);
    });
  });

  describe('getFarmaciaStats', () => {
    it('returns product count and lot alerts', async () => {
      mockPrisma.product.count.mockResolvedValue(55);
      mockPrisma.lot.count
        .mockResolvedValueOnce(4)  // expiring
        .mockResolvedValueOnce(2)  // quarantine
        .mockResolvedValueOnce(7); // low stock
      mockPrisma.stockMovement.findMany.mockResolvedValue([]);

      const result = await service.getFarmaciaStats();
      expect(result.totalProducts).toBe(55);
      expect(result.expiringLots).toBe(4);
      expect(result.quarantineLots).toBe(2);
    });
  });

  describe('getSistemasStats', () => {
    it('returns open ticket count and tickets by priority', async () => {
      mockPrisma.techAsset.count.mockResolvedValue(20);
      mockPrisma.ticket.count.mockResolvedValue(8);
      mockPrisma.ticket.groupBy.mockResolvedValue([
        { priority: 'ALTA', _count: { id: 5 } },
        { priority: 'MEDIA', _count: { id: 3 } },
      ]);
      mockPrisma.maintenance.count.mockResolvedValue(4);
      mockPrisma.license.count.mockResolvedValue(2);

      const result = await service.getSistemasStats();
      expect(result.totalTechAssets).toBe(20);
      expect(result.openTickets).toBe(8);
      expect(result.ticketsByPriority['ALTA']).toBe(5);
      expect(result.scheduledMaintenances).toBe(4);
    });
  });

  describe('getSummary', () => {
    it('returns all three sections + generatedAt', async () => {
      // Wire all mocks with minimal values
      mockPrisma.asset.count.mockResolvedValue(0);
      mockPrisma.asset.groupBy.mockResolvedValue([]);
      mockPrisma.movement.findMany.mockResolvedValue([]);
      mockPrisma.transfer.count.mockResolvedValue(0);
      mockPrisma.product.count.mockResolvedValue(0);
      mockPrisma.lot.count.mockResolvedValue(0);
      mockPrisma.stockMovement.findMany.mockResolvedValue([]);
      mockPrisma.techAsset.count.mockResolvedValue(0);
      mockPrisma.ticket.count.mockResolvedValue(0);
      mockPrisma.ticket.groupBy.mockResolvedValue([]);
      mockPrisma.maintenance.count.mockResolvedValue(0);
      mockPrisma.license.count.mockResolvedValue(0);

      const result = await service.getSummary();
      expect(result).toHaveProperty('almacen');
      expect(result).toHaveProperty('farmacia');
      expect(result).toHaveProperty('sistemas');
      expect(result.generatedAt).toBeInstanceOf(Date);
    });
  });
});
