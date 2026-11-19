import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: true, sedeAccess: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    });

    const hashedRefresh = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: user.passwordHash },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new ForbiddenException('Acceso denegado');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: [],
    };

    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Siempre respondemos igual para no revelar si el correo existe
    if (!user || !user.isActive) {
      return { message: 'Si el correo está registrado, recibirás las instrucciones de recuperación.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: rawToken, resetTokenExpiry: expiry },
    });

    // Si hay configuración SMTP, aquí iría el envío de correo.
    // Por ahora devolvemos el token para que el admin pueda compartirlo con el usuario.
    return {
      message: `Se generó un enlace de recuperación para ${user.firstName} ${user.lastName}. Comparte el token con el usuario.`,
      resetToken: rawToken,
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { resetToken: token } });

    if (!user) {
      throw new BadRequestException('Token inválido o ya utilizado.');
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken: null, resetTokenExpiry: null },
      });
      throw new BadRequestException('El token ha expirado. Solicita uno nuevo.');
    }

    const newHash = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, resetToken: null, resetTokenExpiry: null },
    });

    return { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true, sedeAccess: { include: { sede: true } } },
    });
    if (!user) return null;
    const { passwordHash: _, ...rest } = user;
    return rest;
  }
}
