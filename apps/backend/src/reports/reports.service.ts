import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { AssetStatus, LotStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ─── Excel ────────────────────────────────────────────────────

  async generateAlmacenExcel(): Promise<Buffer> {
    const assets = await this.prisma.asset.findMany({
      where: { status: { not: AssetStatus.BAJA } },
      include: {
        category: { select: { name: true } },
        sede: { select: { name: true } },
      },
      orderBy: [{ sede: { name: 'asc' } }, { name: 'asc' }],
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'SIGIA-CEMINSA';
    wb.created = new Date();

    const ws = wb.addWorksheet('Inventario Almacén');

    ws.columns = [
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Nombre', key: 'name', width: 35 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Sede', key: 'sede', width: 25 },
      { header: 'Valor actual', key: 'currentValue', width: 18 },
      { header: 'Fecha adquisición', key: 'acquisitionDate', width: 20 },
    ];

    // Header style
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' },
    };

    assets.forEach((a) => {
      ws.addRow({
        code: a.code,
        name: a.name,
        category: a.category?.name ?? '',
        status: a.status,
        sede: a.sede?.name ?? '',
        currentValue: a.currentValue ? Number(a.currentValue) : '',
        acquisitionDate: a.acquisitionDate
          ? new Date(a.acquisitionDate).toLocaleDateString('es-CO')
          : '',
      });
    });

    // Alternate row shading
    ws.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' },
        };
      }
    });

    ws.autoFilter = { from: 'A1', to: 'G1' };

    const arrayBuffer = await wb.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  async generateFarmaciaStockExcel(): Promise<Buffer> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        productStock: { include: { sede: { select: { name: true } } } },
        lots: {
          where: { status: LotStatus.DISPONIBLE },
          orderBy: { expiresAt: 'asc' },
        },
      },
      orderBy: { activePrinciple: 'asc' },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'SIGIA-CEMINSA';

    // Sheet 1: Stock por producto
    const wsStock = wb.addWorksheet('Stock por producto');
    wsStock.columns = [
      { header: 'Código', key: 'code', width: 12 },
      { header: 'Principio activo', key: 'activePrinciple', width: 35 },
      { header: 'Nombre comercial', key: 'commercialName', width: 25 },
      { header: 'Categoría', key: 'category', width: 18 },
      { header: 'Stock total', key: 'totalStock', width: 14 },
      { header: 'Stock mínimo', key: 'minimumStock', width: 14 },
      { header: 'Alerta', key: 'alert', width: 12 },
      { header: 'Controlado', key: 'isControlled', width: 13 },
      { header: 'Cadena frío', key: 'coldChain', width: 13 },
    ];

    wsStock.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsStock.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' },
    };

    products.forEach((p) => {
      const totalStock = p.productStock.reduce((acc, s) => acc + Number(s.quantity), 0);
      const belowMin = p.minimumStock != null && totalStock < p.minimumStock;
      const row = wsStock.addRow({
        code: p.code,
        activePrinciple: p.activePrinciple,
        commercialName: p.commercialName ?? '',
        category: p.category,
        totalStock,
        minimumStock: p.minimumStock ?? '',
        alert: belowMin ? 'BAJO MÍNIMO' : '',
        isControlled: p.isControlled ? 'Sí' : 'No',
        coldChain: p.requiresColdChain ? 'Sí' : 'No',
      });
      if (belowMin) {
        row.getCell('alert').font = { color: { argb: 'FFDC2626' }, bold: true };
        row.getCell('totalStock').font = { color: { argb: 'FFDC2626' } };
      }
    });

    wsStock.autoFilter = { from: 'A1', to: 'I1' };

    // Sheet 2: Lotes próximos a vencer (60 días)
    const in60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const expiringLots = await this.prisma.lot.findMany({
      where: {
        status: LotStatus.DISPONIBLE,
        expiresAt: { lte: in60Days, gte: new Date() },
      },
      include: { product: { select: { activePrinciple: true, code: true } } },
      orderBy: { expiresAt: 'asc' },
    });

    const wsLots = wb.addWorksheet('Lotes por vencer (60d)');
    wsLots.columns = [
      { header: 'Código producto', key: 'productCode', width: 16 },
      { header: 'Principio activo', key: 'activePrinciple', width: 35 },
      { header: 'N° lote', key: 'lotNumber', width: 20 },
      { header: 'Vencimiento', key: 'expiresAt', width: 18 },
      { header: 'Días restantes', key: 'daysLeft', width: 15 },
      { header: 'Cantidad', key: 'quantity', width: 12 },
    ];

    wsLots.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsLots.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92400E' },
    };

    expiringLots.forEach((lot) => {
      const daysLeft = lot.expiresAt
        ? Math.ceil((lot.expiresAt.getTime() - Date.now()) / 86400000)
        : null;
      wsLots.addRow({
        productCode: lot.product.code,
        activePrinciple: lot.product.activePrinciple,
        lotNumber: lot.lotNumber,
        expiresAt: lot.expiresAt ? new Date(lot.expiresAt).toLocaleDateString('es-CO') : '',
        daysLeft,
        quantity: Number(lot.quantity),
      });
    });

    const arrayBuffer = await wb.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  // ─── PDF ──────────────────────────────────────────────────────

  async generateDashboardPdf(): Promise<Buffer> {
    const summary = await this.getSummaryData();
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor('#1E3A5F')
        .text('SIGIA-CEMINSA', { align: 'center' });
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#64748B')
        .text('Informe de gestión integral de inventarios y activos', { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(9)
        .fillColor('#94A3B8')
        .text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'center' });

      doc.moveTo(40, doc.y + 10).lineTo(555, doc.y + 10).stroke('#E2E8F0');
      doc.moveDown(1.5);

      const section = (title: string, color: string) => {
        doc
          .fontSize(13)
          .font('Helvetica-Bold')
          .fillColor(color)
          .text(title);
        doc.moveDown(0.3);
      };

      const kv = (label: string, value: string | number) => {
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#374151')
          .text(`${label}: `, { continued: true })
          .font('Helvetica-Bold')
          .fillColor('#111827')
          .text(String(value));
      };

      // Almacén
      section('Almacén', '#1D4ED8');
      kv('Total activos (sin BAJA)', summary.almacen.totalAssets);
      kv('Traslados en tránsito', summary.almacen.transfersPending);
      doc.moveDown(1);

      // Farmacia
      section('Farmacia', '#065F46');
      kv('Productos activos', summary.farmacia.totalProducts);
      kv('Lotes próximos a vencer (30d)', summary.farmacia.expiringLots);
      kv('Lotes en cuarentena', summary.farmacia.quarantineLots);
      doc.moveDown(1);

      // Sistemas
      section('Sistemas TIC', '#7C3AED');
      kv('Activos tecnológicos', summary.sistemas.totalTechAssets);
      kv('Tickets abiertos / en progreso', summary.sistemas.openTickets);
      kv('Mantenimientos programados', summary.sistemas.scheduledMaintenances);
      kv('Licencias por vencer (90d)', summary.sistemas.expiringLicenses);

      doc.end();
    });
  }

  private async getSummaryData() {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const [
      totalAssets,
      transfersPending,
      totalProducts,
      expiringLots,
      quarantineLots,
      totalTechAssets,
      openTickets,
      scheduledMaintenances,
      expiringLicenses,
    ] = await Promise.all([
      this.prisma.asset.count({ where: { status: { not: AssetStatus.BAJA } } }),
      this.prisma.transfer.count({ where: { status: { in: ['DESPACHADO', 'EN_TRANSITO'] as any } } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.lot.count({ where: { status: LotStatus.DISPONIBLE, expiresAt: { lte: in30Days, gte: now } } }),
      this.prisma.lot.count({ where: { status: LotStatus.CUARENTENA } }),
      this.prisma.techAsset.count(),
      this.prisma.ticket.count({ where: { status: { in: ['ABIERTO', 'EN_PROGRESO'] as any } } }),
      this.prisma.maintenance.count({ where: { status: 'PROGRAMADO' as any } }),
      this.prisma.license.count({ where: { isActive: true, expiresAt: { lte: in90Days, gte: now } } }),
    ]);

    return {
      almacen: { totalAssets, transfersPending },
      farmacia: { totalProducts, expiringLots, quarantineLots },
      sistemas: { totalTechAssets, openTickets, scheduledMaintenances, expiringLicenses },
    };
  }
}
