import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TicketStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/create-ticket.dto';

// Terminal states — once reached the ticket cannot go back
const TERMINAL_STATUSES: TicketStatus[] = [
  TicketStatus.CERRADO,
  TicketStatus.CANCELADO,
];

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(params: { status?: TicketStatus; assignedToId?: string; page?: number; limit?: number }) {
    const { status, assignedToId, page = 1, limit = 25 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {
      ...(status && { status }),
      ...(assignedToId && { assignedToId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          createdBy: { select: { firstName: true, lastName: true } },
          assignedTo: { select: { firstName: true, lastName: true } },
          techAsset: {
            include: {
              asset: { select: { name: true, plaque: true } },
              sede: { select: { name: true } },
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        techAsset: {
          include: {
            asset: { select: { name: true, plaque: true, serial: true } },
            sede: { select: { name: true } },
          },
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    return ticket;
  }

  async create(dto: CreateTicketDto, createdById: string) {
    if (dto.techAssetId) {
      const tech = await this.prisma.techAsset.findUnique({
        where: { id: dto.techAssetId },
      });
      if (!tech) throw new NotFoundException('Equipo TIC no encontrado');
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        ...dto,
        createdById,
        status: TicketStatus.ABIERTO,
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    await this.audit.log({
      userId: createdById,
      module: 'SISTEMAS',
      action: 'CREATE_TICKET',
      entityType: 'Ticket',
      entityId: ticket.id,
      newValues: { title: dto.title, priority: dto.priority },
    });

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, userId: string) {
    const ticket = await this.findOne(id);

    if (TERMINAL_STATUSES.includes(ticket.status)) {
      throw new ForbiddenException(
        `El ticket ya está en estado "${ticket.status}" y no puede modificarse`,
      );
    }

    if (dto.assignedToId) {
      const assignee = await this.prisma.user.findUnique({ where: { id: dto.assignedToId } });
      if (!assignee || !assignee.isActive) {
        throw new BadRequestException('El técnico asignado no existe o está inactivo');
      }
    }

    const closingStatuses: TicketStatus[] = [TicketStatus.RESUELTO, TicketStatus.CERRADO, TicketStatus.CANCELADO];
    const isClosing = dto.status && closingStatuses.includes(dto.status);

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...dto,
        ...(isClosing && { closedAt: new Date() }),
        ...(dto.status === TicketStatus.EN_PROGRESO && ticket.status === TicketStatus.ABIERTO
          ? {} // just update status
          : {}),
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });

    await this.audit.log({
      userId,
      module: 'SISTEMAS',
      action: 'UPDATE_TICKET',
      entityType: 'Ticket',
      entityId: id,
      oldValues: { status: ticket.status, assignedToId: ticket.assignedToId },
      newValues: dto as Record<string, unknown>,
    });

    return updated;
  }
}
