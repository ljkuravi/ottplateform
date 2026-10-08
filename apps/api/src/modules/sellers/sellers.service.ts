import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class SellersService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        sellerWallet: true,
      },
    });

    if (!profile) {
      throw new ForbiddenException('Seller profile not found. Please apply to become a seller.');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      availableListingsCount,
      activeOrdersCount,
      completedOrdersCount,
      pendingOrdersCount,
      todayOrders,
      pendingWithdrawals,
      recentOrders,
    ] = await Promise.all([
      this.prisma.listing.count({
        where: { sellerId: profile.id, status: 'ACTIVE' },
      }),
      this.prisma.order.count({
        where: { sellerId: profile.id, status: { in: ['CONFIRMED', 'PROCESSING', 'DELIVERED'] } },
      }),
      this.prisma.order.count({
        where: { sellerId: profile.id, status: 'COMPLETED' },
      }),
      this.prisma.order.count({
        where: { sellerId: profile.id, status: 'PENDING' },
      }),
      this.prisma.order.findMany({
        where: {
          sellerId: profile.id,
          createdAt: { gte: todayStart },
        },
        select: { sellerEarning: true },
      }),
      this.prisma.withdrawal.findMany({
        where: {
          sellerProfileId: profile.id,
          status: { in: ['REQUESTED', 'UNDER_REVIEW', 'PROCESSING'] },
        },
        select: { amount: true },
      }),
      this.prisma.order.findMany({
        where: { sellerId: profile.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { fullName: true, email: true } },
          items: true,
        },
      }),
    ]);

    const todaySalesAmount = todayOrders.reduce((sum, o) => sum + o.sellerEarning, 0);
    const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    return {
      profile,
      stats: {
        totalSales: profile.totalSales,
        todaySalesAmount,
        todayOrdersCount: todayOrders.length,
        availableListings: availableListingsCount,
        activeOrders: activeOrdersCount,
        completedOrders: completedOrdersCount,
        pendingOrders: pendingOrdersCount,
        availableEarnings: profile.sellerWallet?.availableEarnings || 0,
        totalEarnings: profile.sellerWallet?.totalEarnings || 0,
        withdrawnAmount: profile.sellerWallet?.withdrawnAmount || 0,
        pendingWithdrawal: pendingWithdrawalAmount,
      },
      recentOrders,
    };
  }

  async getPublicProfile(sellerIdOrDisplayName: string) {
    const profile = await this.prisma.sellerProfile.findFirst({
      where: {
        OR: [{ id: sellerIdOrDisplayName }, { displayName: sellerIdOrDisplayName }],
      },
      include: {
        listings: {
          where: { status: 'ACTIVE' },
          include: { platform: true, category: true },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            buyer: { select: { fullName: true } },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Seller profile not found');
    }

    return profile;
  }
}
