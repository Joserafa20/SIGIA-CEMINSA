import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

const mockPrisma = {
  ticket: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  techAsset: { findUnique: jest.fn() },
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

const makeTicket = (overrides: Partial<any> = {}) => ({
  id: 'ticket-1',
  title: 'PC no enciende',
  status: TicketStatus.ABIERTO,
  priority: TicketPriority.ALTA,
  requestedById: 'user-1',
  techAssetId: null,
  closedAt: null,
  ...overrides,
});

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<TicketsService>(TicketsService);
  });

  describe('update', () => {
    it('throws NotFoundException when ticket does not exist', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null);
      await expect(service.update('non-existent', {}, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when ticket is CERRADO', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(makeTicket({ status: TicketStatus.CERRADO }));
      await expect(service.update('ticket-1', { status: TicketStatus.EN_PROGRESO }, 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException when ticket is CANCELADO', async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(makeTicket({ status: TicketStatus.CANCELADO }));
      await expect(service.update('ticket-1', {}, 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('sets closedAt when transitioning to CERRADO', async () => {
      const ticket = makeTicket({ status: TicketStatus.RESUELTO });
      mockPrisma.ticket.findUnique.mockResolvedValue(ticket);
      mockPrisma.ticket.update.mockResolvedValue({ ...ticket, status: TicketStatus.CERRADO, closedAt: new Date() });

      await service.update('ticket-1', { status: TicketStatus.CERRADO }, 'user-1');

      const updateCall = mockPrisma.ticket.update.mock.calls[0][0];
      expect(updateCall.data.closedAt).toBeDefined();
      expect(updateCall.data.status).toBe(TicketStatus.CERRADO);
    });

    it('sets closedAt when transitioning to CANCELADO', async () => {
      const ticket = makeTicket({ status: TicketStatus.ABIERTO });
      mockPrisma.ticket.findUnique.mockResolvedValue(ticket);
      mockPrisma.ticket.update.mockResolvedValue({ ...ticket, status: TicketStatus.CANCELADO });

      await service.update('ticket-1', { status: TicketStatus.CANCELADO }, 'user-1');

      const updateCall = mockPrisma.ticket.update.mock.calls[0][0];
      expect(updateCall.data.closedAt).toBeDefined();
    });

    it('does NOT set closedAt for non-terminal transitions', async () => {
      const ticket = makeTicket({ status: TicketStatus.ABIERTO });
      mockPrisma.ticket.findUnique.mockResolvedValue(ticket);
      mockPrisma.ticket.update.mockResolvedValue({ ...ticket, status: TicketStatus.EN_PROGRESO });

      await service.update('ticket-1', { status: TicketStatus.EN_PROGRESO }, 'user-1');

      const updateCall = mockPrisma.ticket.update.mock.calls[0][0];
      expect(updateCall.data.closedAt).toBeUndefined();
    });

    it('allows transitioning ABIERTO → EN_PROGRESO', async () => {
      const ticket = makeTicket({ status: TicketStatus.ABIERTO });
      mockPrisma.ticket.findUnique.mockResolvedValue(ticket);
      mockPrisma.ticket.update.mockResolvedValue({ ...ticket, status: TicketStatus.EN_PROGRESO });

      const result = await service.update('ticket-1', { status: TicketStatus.EN_PROGRESO }, 'user-1');
      expect(result.status).toBe(TicketStatus.EN_PROGRESO);
    });

    it('allows transitioning EN_PROGRESO → RESUELTO', async () => {
      const ticket = makeTicket({ status: TicketStatus.EN_PROGRESO });
      mockPrisma.ticket.findUnique.mockResolvedValue(ticket);
      mockPrisma.ticket.update.mockResolvedValue({ ...ticket, status: TicketStatus.RESUELTO });

      const result = await service.update('ticket-1', { status: TicketStatus.RESUELTO }, 'user-1');
      expect(result.status).toBe(TicketStatus.RESUELTO);
    });
  });

  describe('findAll', () => {
    it('returns paginated results', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([makeTicket()]);
      mockPrisma.ticket.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
