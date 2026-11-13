import { Injectable } from '@nestjs/common';
import { AssetStatus, LotStatus, TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [almacen, farmacia, sistemas] = await Promise.all([
      this.getAlmacenStats(),
      this.getFarmaciaStats(),
      this.getSistemasStats(),
    ]);
    return { almacen, farmacia, sistemas, generatedAt: new Date() };
  }

  async getAlmacenStats() {
    const [
      totalAssets,
      byStatus,
      recentMovements,
      transfersPending,
    ] = await Promise.all([
      this.prisma.asset.count({ where: { status: { not: AssetStatus.BAJA } } }),
      this.prisma.asset.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.movement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: { select: { name: true, code: true } },
          requestedBy: { select: { name: true } },
        },
      }),
      this.prisma.transfer.count({
        where: { status: { in: ['DESPACHADO', 'EN_TRANSITO'] as any } },
      }),
    ]);

    return {
      totalAssets,
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.id])),
      recentMovements,
      transfersPending,
    };
  }

  async getFarmaciaStats() {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalProducts,
      expiringLots,
      quarantineLots,
      lowStockProducts,
      recentDispensations,
    ] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.lot.count({
        where: {
          status: LotStatus.DISPONIBLE,
          expiresAt: { lte: in30Days, gte: now },
        },
      }),
      this.prisma.lot.count({ where: { status: LotStatus.CUARENTENA } }),
      // Products where any sede stock < minimumStock
      this.prisma.product.count({
        where: {
          isActive: true,
          minimumStock: { not: null },
          productStock: { some: {} },
        },
      }),
      this.prisma.stockMovement.findMany({
        take: 5,
        where: { movementType: 'SALIDA' as any },
        orderBy: { createdAt: 'desc' },
        include: {
          lot: {
            include: {
              product: { select: { activePrinciple: true, code: true } },
            },
          },
        },
      }),
    ]);

    return {
      totalProducts,
      expiringLots,
      quarantineLots,
      lowStockProducts,
      recentDispensations,
    };
  }

  async getSistemasStats() {
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const [
      totalTechAssets,
      openTickets,
      ticketsByPriority,
      scheduledMaintenances,
      expiringLicenses,
    ] = await Promise.all([
      this.prisma.techAsset.count(),
      this.prisma.ticket.count({
        where: { status: { in: [TicketStatus.ABIERTO, TicketStatus.EN_PROGRESO] } },
      }),
      this.prisma.ticket.groupBy({
        by: ['priority'],
        where: { status: { in: [TicketStatus.ABIERTO, TicketStatus.EN_PROGRESO] } },
        _count: { id: true },
      }),
      this.prisma.maintenance.count({
        where: { status: 'PROGRAMADO' },
      }),
      this.prisma.license.count({
        where: {
          expiresAt: { lte: in90Days, gte: now },
        },
      }),
    ]);

    return {
      totalTechAssets,
      openTickets,
      ticketsByPriority: Object.fromEntries(
        ticketsByPriority.map((t) => [t.priority, t._count.id]),
      ),
      scheduledMaintenances,
      expiringLicenses,
    };
  }

  async getAlmacenTimeline(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const movements = await this.prisma.movement.groupBy({
      by: ['movementType', 'createdAt'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      _sum: { quantity: true },
    });
    return movements;
  }

  async getFarmaciaStockAlerts() {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [expiring, quarantine] = await Promise.all([
      this.prisma.lot.findMany({
        where: {
          status: LotStatus.DISPONIBLE,
          expiresAt: { lte: in30Days, gte: now },
        },
        include: { product: { select: { activePrinciple: true, code: true } } },
        orderBy: { expiresAt: 'asc' },
        take: 20,
      }),
      this.prisma.lot.findMany({
        where: { status: LotStatus.CUARENTENA },
        include: { product: { select: { activePrinciple: true, code: true } } },
        take: 20,
      }),
    ]);

    return { expiring, quarantine };
  }
}
