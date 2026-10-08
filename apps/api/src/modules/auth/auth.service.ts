import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { hashPassword, verifyPassword } from '../../common/crypto.utils';
import { RegisterDto, LoginDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new BadRequestException('An account with this email address already exists');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          fullName: dto.fullName.trim(),
          phone: dto.phone?.trim(),
          passwordHash: hashPassword(dto.password),
          role: RoleType.USER,
          isEmailVerified: false,
          otpCode,
          otpExpiresAt,
        },
      });

      // Initialize buyer wallet
      await tx.wallet.create({
        data: {
          userId: created.id,
          balance: 0,
        },
      });

      // Initialize cart
      await tx.cart.create({
        data: {
          userId: created.id,
        },
      });

      return created;
    });

    this.logger.log(`[AUTH] Registration OTP generated for ${user.email}: [${otpCode}]`);

    return {
      message: 'Account created successfully. Please verify the OTP sent to your email.',
      email: user.email,
      otpDebug: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { sellerProfile: true },
    });

    if (!user) {
      throw new NotFoundException('Account not found');
    }

    if (user.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP code has expired. Please request a new one.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    const tokens = await this.generateTokens(user);

    return {
      message: 'Email successfully verified',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { sellerProfile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isSuspended || user.isBanned) {
      throw new UnauthorizedException('Your account has been restricted. Please contact support.');
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Account is temporarily locked due to failed attempts. Try again in ${waitMinutes} minute(s).`,
      );
    }

    const isValid = verifyPassword(dto.password, user.passwordHash);
    if (!isValid) {
      const failed = user.failedLoginAttempts + 1;
      let lockUntil: Date | null = null;
      if (failed >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // lock 15 mins
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: failed, lockUntil },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset failed attempts on success
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockUntil: null },
      });
    }

    const tokens = await this.generateTokens(user);

    return {
      message: 'Login successful',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      return { message: 'If an account exists, a recovery OTP has been sent.' };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    this.logger.log(`[AUTH] Password recovery OTP for ${user.email}: [${otpCode}]`);

    return {
      message: 'Recovery OTP has been generated.',
      email: user.email,
      otpDebug: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new NotFoundException('Account not found');
    }

    if (user.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP code has expired. Please request a new one.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(dto.newPassword),
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return { message: 'Password has been reset successfully. You can now login.' };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'subvault_super_secret_jwt_refresh_token_key_2026_m82z01p',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { sellerProfile: true },
      });

      if (!user || user.isSuspended || user.isBanned) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        sellerProfile: true,
        sellerApplication: true,
        wallet: true,
        cart: {
          include: {
            items: true,
          },
        },
        _count: {
          select: {
            buyerOrders: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      user: this.sanitizeUser(user),
      wallet: user.wallet,
      sellerProfile: user.sellerProfile,
      sellerApplication: user.sellerApplication,
      cartItemCount: user.cart?.items.length || 0,
      unreadNotificationCount: user._count.notifications,
      totalOrders: user._count.buyerOrders,
    };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'subvault_super_secret_jwt_access_token_key_2026_x87b92q',
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'subvault_super_secret_jwt_refresh_token_key_2026_m82z01p',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, otpCode, otpExpiresAt, ...safe } = user;
    return safe;
  }
}
