import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { WithdrawalStatus } from '@prisma/client';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  async getSellerWallet(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        sellerWallet: {
          include: {
            earnings: {
              take: 20,
              orderBy: { createdAt: 'desc' },
              include: {
                order: {
                  select: { orderNumber: true, totalAmount: true },
                },
              },
            },
            withdrawals: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new ForbiddenException('Seller profile not found');
    }

    return profile.sellerWallet;
  }

  async requestWithdrawal(userId: string, data: { amount: number; payoutMethod: string; payoutDetails: string }) {
    const amount = Number(data.amount);
    if (isNaN(amount) || amount < 200) {
      throw new BadRequestException('Minimum withdrawal amount is ₹200');
    }
    if (amount > 50000) {
      throw new BadRequestException('Maximum single withdrawal limit is ₹50,000');
    }

    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      include: { sellerWallet: true },
    });

    if (!profile || !profile.sellerWallet) {
      throw new ForbiddenException('Seller profile or wallet not found');
    }

    if (profile.sellerWallet.availableEarnings < amount) {
      throw new BadRequestException(
        `Insufficient available earnings. You have ₹${profile.sellerWallet.availableEarnings.toFixed(2)}, cannot withdraw ₹${amount.toFixed(2)}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Deduct available earnings, move to pending
      await tx.sellerWallet.update({
        where: { id: profile.sellerWallet!.id },
        data: {
          availableEarnings: profile.sellerWallet!.availableEarnings - amount,
          pendingEarnings: profile.sellerWallet!.pendingEarnings + amount,
        },
      });

      const withdrawal = await tx.withdrawal.create({
        data: {
          sellerWalletId: profile.sellerWallet!.id,
          sellerProfileId: profile.id,
          amount,
          payoutMethod: data.payoutMethod,
          payoutDetails: data.payoutDetails,
          status: WithdrawalStatus.REQUESTED,
        },
      });

      // Notify Admins
      const admins = await tx.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      });

      for (const a of admins) {
        await tx.notification.create({
          data: {
            userId: a.id,
            type: 'WITHDRAWAL_REQUESTED',
            title: 'New Withdrawal Request',
            message: `${profile.displayName} requested payout of ₹${amount.toFixed(2)} via ${data.payoutMethod}`,
            linkUrl: '/admin/withdrawals',
          },
        });
      }

      return withdrawal;
    });
  }

  async getSellerWithdrawals(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new ForbiddenException('Seller profile not found');
    }

    return this.prisma.withdrawal.findMany({
      where: { sellerProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
