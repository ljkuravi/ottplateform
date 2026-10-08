import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          pendingBalance: 0,
          totalAdded: 0,
          totalSpent: 0,
        },
      });
    }

    return wallet;
  }

  async getTransactions(userId: string, query: { page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const wallet = await this.getWallet(userId);

    const [total, transactions] = await Promise.all([
      this.prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async creditWallet(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    idempotencyKey?: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (idempotencyKey) {
      const existing = await this.prisma.walletTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId, balance: 0 },
        });
      }

      const newBalance = wallet.balance + amount;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          totalAdded: wallet.totalAdded + amount,
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId,
          amount,
          balanceAfter: newBalance,
          type: TransactionType.CREDIT,
          status: TransactionStatus.SUCCESS,
          description,
          referenceId,
          idempotencyKey,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          type: 'WALLET_CREDIT',
          title: 'Wallet Credited',
          message: `₹${amount.toFixed(2)} has been successfully credited to your wallet. Current balance: ₹${newBalance.toFixed(2)}`,
          linkUrl: '/wallet',
        },
      });

      return transaction;
    });
  }
}
