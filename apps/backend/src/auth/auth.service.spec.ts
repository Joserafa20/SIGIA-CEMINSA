import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('argon2');

const mockPrisma = {
  user: { findUnique: jest.fn(), update: jest.fn() },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('signed-token'),
};

const makeUser = (overrides: Partial<any> = {}) => ({
  id: 'user-1',
  email: 'test@ceminsa.gov.co',
  passwordHash: '$argon2id$hashed',
  isActive: true,
  roles: [{ role: 'ALMACENISTA' }],
  sedeAccess: [],
  refreshTokenHash: null,
  name: 'Test User',
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('throws UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'unknown@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user is inactive', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser({ isActive: false }));
      await expect(
        service.login({ email: 'test@ceminsa.gov.co', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@ceminsa.gov.co', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (argon2.hash as jest.Mock).mockResolvedValue('$argon2id$hashed-refresh');
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.login({ email: 'test@ceminsa.gov.co', password: 'correctpass' });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('calls JwtService.sign with correct subject', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(makeUser());
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (argon2.hash as jest.Mock).mockResolvedValue('$argon2id$hashed-refresh');
      mockPrisma.user.update.mockResolvedValue({});

      await service.login({ email: 'test@ceminsa.gov.co', password: 'correct' });
      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'user-1' }),
        expect.anything(),
      );
    });
  });
});
