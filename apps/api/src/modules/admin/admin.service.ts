import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  RoleType,
  ApplicationStatus,
  SellerStatus,
  ListingStatus,
  OrderStatus,
  WithdrawalStatus,
  RefundStatus,
  TransactionType,
  TransactionStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalSellers,
      pendingApplications,
      totalOrders,
      todayOrders,
      ordersAggregate,
      pendingWithdrawals,
      pendingRefunds,
      activeListings,
      openTickets,
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.sellerProfile.count(),
      this.prisma.sellerApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
          platformFee: true,
          sellerEarning: true,
        },
      }),
      this.prisma.withdrawal.count({ where: { status: 'REQUESTED' } }),
      this.prisma.refund.count({ where: { status: 'PENDING' } }),
      this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { fullName: true, email: true } },
          seller: { select: { displayName: true } },
        },
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, email: true, role: true, createdAt: true },
      }),
    ]);

    return {
      kpi: {
        totalUsers,
        totalSellers,
        pendingApplications,
        totalOrders,
        todayOrders,
        totalRevenue: ordersAggregate._sum.totalAmount || 0,
        platformEarnings: ordersAggregate._sum.platformFee || 0,
        sellerEarnings: ordersAggregate._sum.sellerEarning || 0,
        pendingWithdrawals,
        pendingRefunds,
        activeListings,
        openTickets,
      },
      recentOrders,
      recentUsers,
    };
  }

  async getUsers(query: { search?: string; role?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.role) {
      where.role = query.role as RoleType;
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: true,
          sellerProfile: true,
          _count: {
            select: { buyerOrders: true },
          },
        },
      }),
    ]);

    const sanitizedUsers = users.map((u) => {
      const { passwordHash, otpCode, ...safe } = u;
      return safe;
    });

    return {
      data: sanitizedUsers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUserStatus(
    adminId: string,
    adminEmail: string,
    userId: string,
    data: { isSuspended?: boolean; isBanned?: boolean; role?: RoleType },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorEmail: adminEmail,
        action: 'USER_STATUS_UPDATED',
        entity: 'User',
        entityId: userId,
        metadata: JSON.stringify(data),
      },
    });

    const { passwordHash, ...safe } = updated;
    return safe;
  }

  async getSellerApplications(status?: ApplicationStatus) {
    return this.prisma.sellerApplication.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, createdAt: true } },
      },
    });
  }

  async reviewSellerApplication(
    adminId: string,
    adminEmail: string,
    applicationId: string,
    data: { action: 'APPROVE' | 'REJECT'; rejectionReason?: string },
  ) {
    const application = await this.prisma.sellerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (data.action === 'APPROVE') {
      return this.prisma.$transaction(async (tx) => {
        // Update application
        await tx.sellerApplication.update({
          where: { id: applicationId },
          data: {
            status: ApplicationStatus.APPROVED,
            reviewedByAdminId: adminId,
            reviewedAt: new Date(),
          },
        });

        // Promote user role to SELLER
        await tx.user.update({
          where: { id: application.userId },
          data: { role: RoleType.SELLER },
        });

        // Create or activate seller profile
        const profile = await tx.sellerProfile.upsert({
          where: { userId: application.userId },
          update: {
            displayName: application.displayName,
            bio: application.aboutSeller,
            status: SellerStatus.APPROVED,
            isVerified: true,
            payoutMethod: application.payoutMethod,
            upiId: application.upiId,
          },
          create: {
            userId: application.userId,
            displayName: application.displayName,
            bio: application.aboutSeller,
            status: SellerStatus.APPROVED,
            isVerified: true,
            payoutMethod: application.payoutMethod,
            upiId: application.upiId,
          },
        });

        // Initialize seller wallet
        await tx.sellerWallet.upsert({
          where: { sellerProfileId: profile.id },
          update: {},
          create: { sellerProfileId: profile.id },
        });

        // Notify user
        await tx.notification.create({
          data: {
            userId: application.userId,
            type: 'SELLER_APPROVED',
            title: 'Seller Application Approved! 🎉',
            message: 'Congratulations! Your seller application has been approved. You can now access your Seller Dashboard and list subscriptions.',
            linkUrl: '/seller/dashboard',
          },
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            actorId: adminId,
            actorEmail: adminEmail,
            action: 'SELLER_APPROVED',
            entity: 'SellerApplication',
            entityId: applicationId,
            metadata: JSON.stringify({ displayName: application.displayName }),
          },
        });

        return { message: 'Seller application approved successfully' };
      });
    } else {
      // REJECT
      return this.prisma.$transaction(async (tx) => {
        await tx.sellerApplication.update({
          where: { id: applicationId },
          data: {
            status: ApplicationStatus.REJECTED,
            rejectionReason: data.rejectionReason || 'Application does not meet platform criteria.',
            reviewedByAdminId: adminId,
            reviewedAt: new Date(),
          },
        });

        await tx.notification.create({
          data: {
            userId: application.userId,
            type: 'SELLER_REJECTED',
            title: 'Seller Application Update',
            message: `Your seller application could not be approved at this time: ${data.rejectionReason || 'Please verify details and re-apply.'}`,
            linkUrl: '/become-seller',
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: adminId,
            actorEmail: adminEmail,
            action: 'SELLER_REJECTED',
            entity: 'SellerApplication',
            entityId: applicationId,
            metadata: JSON.stringify({ reason: data.rejectionReason }),
          },
        });

        return { message: 'Seller application rejected' };
      });
    }
  }

  async getAdminListings(query: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {};
    if (query.status) {
      where.status = query.status as ListingStatus;
    }

    const [total, listings] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          platform: true,
          category: true,
          seller: true,
        },
      }),
    ]);

    return {
      data: listings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateListingAdmin(
    adminId: string,
    adminEmail: string,
    id: string,
    data: { status?: ListingStatus; isFeatured?: boolean },
  ) {
    const updated = await this.prisma.listing.update({
      where: { id },
      data,
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorEmail: adminEmail,
        action: 'LISTING_UPDATED_ADMIN',
        entity: 'Listing',
        entityId: id,
        metadata: JSON.stringify(data),
      },
    });

    return updated;
  }

  async getAdminOrders(query: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (query.status) {
      where.status = query.status as OrderStatus;
    }

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { fullName: true, email: true } },
          seller: { select: { displayName: true } },
          items: true,
          refund: true,
        },
      }),
    ]);

    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getWithdrawals() {
    return this.prisma.withdrawal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sellerProfile: {
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
          },
        },
      },
    });
  }

  async reviewWithdrawal(
    adminId: string,
    adminEmail: string,
    withdrawalId: string,
    data: { action: 'APPROVE' | 'REJECT'; referenceId?: string; rejectionReason?: string },
  ) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { sellerWallet: true, sellerProfile: true },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    if (withdrawal.status !== 'REQUESTED' && withdrawal.status !== 'UNDER_REVIEW') {
      throw new BadRequestException('Withdrawal has already been processed');
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.action === 'APPROVE') {
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: WithdrawalStatus.COMPLETED,
            referenceId: data.referenceId || `PAYOUT-TX-${Date.now()}`,
            processedAt: new Date(),
          },
        });

        // Deduct pending earnings and add to withdrawn amount
        await tx.sellerWallet.update({
          where: { id: withdrawal.sellerWalletId },
          data: {
            pendingEarnings: Math.max(0, withdrawal.sellerWallet.pendingEarnings - withdrawal.amount),
            withdrawnAmount: withdrawal.sellerWallet.withdrawnAmount + withdrawal.amount,
          },
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.sellerProfile.userId,
            type: 'WITHDRAWAL_APPROVED',
            title: 'Payout Processed Successfully',
            message: `Your payout of ₹${withdrawal.amount.toFixed(2)} has been transferred via ${withdrawal.payoutMethod}. Ref: ${data.referenceId || 'BANK-TRANSFER'}`,
            linkUrl: '/seller/withdrawals',
          },
        });
      } else {
        // REJECT - return funds to availableEarnings
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: WithdrawalStatus.REJECTED,
            rejectionReason: data.rejectionReason || 'Payout details could not be validated.',
            processedAt: new Date(),
          },
        });

        await tx.sellerWallet.update({
          where: { id: withdrawal.sellerWalletId },
          data: {
            pendingEarnings: Math.max(0, withdrawal.sellerWallet.pendingEarnings - withdrawal.amount),
            availableEarnings: withdrawal.sellerWallet.availableEarnings + withdrawal.amount,
          },
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.sellerProfile.userId,
            type: 'WITHDRAWAL_REJECTED',
            title: 'Payout Request Rejected',
            message: `Your withdrawal request of ₹${withdrawal.amount.toFixed(2)} was rejected: ${data.rejectionReason}. Funds have been restored to your available earnings.`,
            linkUrl: '/seller/withdrawals',
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorEmail: adminEmail,
          action: data.action === 'APPROVE' ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
          entity: 'Withdrawal',
          entityId: withdrawalId,
          metadata: JSON.stringify(data),
        },
      });

      return { success: true, message: `Withdrawal ${data.action.toLowerCase()}d successfully` };
    });
  }

  async getRefunds() {
    return this.prisma.refund.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            buyer: { select: { fullName: true, email: true } },
            seller: { select: { displayName: true } },
            items: true,
          },
        },
        requester: { select: { fullName: true, email: true } },
      },
    });
  }

  async reviewRefund(
    adminId: string,
    adminEmail: string,
    refundId: string,
    data: { action: 'APPROVE' | 'REJECT'; rejectionReason?: string },
  ) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        order: {
          include: {
            buyer: { include: { wallet: true } },
            seller: { include: { sellerWallet: true } },
          },
        },
      },
    });

    if (!refund) {
      throw new NotFoundException('Refund request not found');
    }

    if (refund.status !== 'PENDING') {
      throw new BadRequestException('Refund dispute has already been resolved');
    }

    const order = refund.order;

    return this.prisma.$transaction(async (tx) => {
      if (data.action === 'APPROVE') {
        const refundAmount = order.totalAmount;

        // 1. Update refund record
        await tx.refund.update({
          where: { id: refundId },
          data: {
            status: RefundStatus.APPROVED,
            refundedAmount: refundAmount,
            resolvedAt: new Date(),
          },
        });

        // 2. Update order status
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.REFUNDED },
        });

        // 3. Atomically credit buyer wallet
        let buyerWallet = order.buyer.wallet;
        if (!buyerWallet) {
          buyerWallet = await tx.wallet.create({ data: { userId: order.buyerId } });
        }

        const newBuyerBalance = buyerWallet.balance + refundAmount;
        await tx.wallet.update({
          where: { id: buyerWallet.id },
          data: {
            balance: newBuyerBalance,
            totalSpent: Math.max(0, buyerWallet.totalSpent - refundAmount),
          },
        });

        // 4. Wallet transaction ledger
        await tx.walletTransaction.create({
          data: {
            walletId: buyerWallet.id,
            userId: order.buyerId,
            amount: refundAmount,
            balanceAfter: newBuyerBalance,
            type: TransactionType.REFUND,
            status: TransactionStatus.SUCCESS,
            description: `Refund for Order #${order.orderNumber}`,
            referenceId: order.id,
          },
        });

        // 5. Debit seller wallet
        if (order.seller.sellerWallet) {
          await tx.sellerWallet.update({
            where: { id: order.seller.sellerWallet.id },
            data: {
              availableEarnings: Math.max(0, order.seller.sellerWallet.availableEarnings - order.sellerEarning),
              totalEarnings: Math.max(0, order.seller.sellerWallet.totalEarnings - order.sellerEarning),
            },
          });
        }

        // 6. Notifications
        await tx.notification.createMany({
          data: [
            {
              userId: order.buyerId,
              type: 'REFUND_APPROVED',
              title: 'Refund Approved & Credited',
              message: `Your refund request for Order #${order.orderNumber} (₹${refundAmount.toFixed(2)}) has been approved and credited back to your wallet.`,
              linkUrl: '/wallet',
            },
            {
              userId: order.seller.userId,
              type: 'ORDER_CANCELLED',
              title: 'Order Refunded by Admin',
              message: `Order #${order.orderNumber} dispute was resolved in buyer's favor. ₹${order.sellerEarning.toFixed(2)} deducted from earnings.`,
              linkUrl: '/seller/orders',
            },
          ],
        });
      } else {
        // REJECT
        await tx.refund.update({
          where: { id: refundId },
          data: {
            status: RefundStatus.REJECTED,
            rejectionReason: data.rejectionReason || 'Claim could not be verified.',
            resolvedAt: new Date(),
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.COMPLETED },
        });

        await tx.notification.create({
          data: {
            userId: order.buyerId,
            type: 'REFUND_REJECTED',
            title: 'Refund Request Rejected',
            message: `Your refund request for Order #${order.orderNumber} was reviewed and rejected: ${data.rejectionReason || 'Evidence insufficient'}.`,
            linkUrl: `/orders/${order.id}`,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          actorEmail: adminEmail,
          action: data.action === 'APPROVE' ? 'REFUND_APPROVED' : 'REFUND_REJECTED',
          entity: 'Refund',
          entityId: refundId,
          metadata: JSON.stringify({ orderId: order.id, amount: order.totalAmount }),
        },
      });

      return { success: true, message: `Refund dispute ${data.action.toLowerCase()}d` };
    });
  }

  async getAuditLogs(query: { entity?: string; action?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSettings() {
    return this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateSetting(key: string, value: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, description: 'Marketplace configuration parameter' },
    });
  }
}
