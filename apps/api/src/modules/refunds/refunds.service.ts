import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RefundReason, RefundStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  async requestRefund(buyerId: string, data: { orderId: string; reason: RefundReason; details: string; evidenceUrl?: string }) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: { refund: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== buyerId) {
      throw new BadRequestException('You can only dispute your own orders');
    }

    if (order.refund) {
      throw new BadRequestException('A dispute or refund request has already been filed for this order');
    }

    if (order.status === 'REFUNDED' || order.status === 'CANCELLED') {
      throw new BadRequestException('Order is already refunded or cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          orderId: order.id,
          requesterId: buyerId,
          reason: data.reason,
          details: data.details,
          evidenceUrl: data.evidenceUrl,
          status: RefundStatus.PENDING,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.REFUND_REQUESTED },
      });

      // Notify Admins
      const admins = await tx.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      });

      for (const a of admins) {
        await tx.notification.create({
          data: {
            userId: a.id,
            type: 'REFUND_REQUESTED',
            title: 'Refund Request Filed',
            message: `Buyer filed dispute for Order #${order.orderNumber} (₹${order.totalAmount}).`,
            linkUrl: '/admin/refunds',
          },
        });
      }

      return refund;
    });
  }

  async getMyRefunds(buyerId: string) {
    return this.prisma.refund.findMany({
      where: { requesterId: buyerId },
      include: {
        order: {
          select: { orderNumber: true, totalAmount: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
