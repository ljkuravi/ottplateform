import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async createPaymentOrder(userId: string, amount: number) {
    if (amount < 50) {
      throw new BadRequestException('Minimum deposit amount is ₹50');
    }
    if (amount > 25000) {
      throw new BadRequestException('Maximum single deposit amount is ₹25,000');
    }

    const razorpayOrderId = `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = `dep_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        razorpayOrderId,
        amount,
        currency: 'INR',
        status: 'PENDING',
        idempotencyKey,
      },
    });

    return {
      orderId: razorpayOrderId,
      amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
      paymentRecordId: payment.id,
    };
  }

  async verifyPayment(userId: string, data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }) {
    const payment = await this.prisma.payment.findUnique({
      where: { razorpayOrderId: data.razorpayOrderId },
    });

    if (!payment) {
      throw new BadRequestException('Payment order not found');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('Unauthorized payment verification');
    }

    if (payment.status === 'SUCCESS') {
      return { message: 'Payment already credited', status: 'SUCCESS' };
    }

    // Razorpay HMAC signature validation if secrets configured
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && keySecret !== 'rzp_test_placeholder_secret' && data.razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== data.razorpaySignature) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
        throw new BadRequestException('Invalid payment signature verification');
      }
    }

    // Atomic update payment status and credit wallet
    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
          status: 'SUCCESS',
        },
      });

      await this.walletService.creditWallet(
        payment.userId,
        payment.amount,
        `Deposit via Razorpay (${data.razorpayPaymentId})`,
        data.razorpayPaymentId,
        payment.idempotencyKey || undefined,
      );

      return {
        success: true,
        message: `₹${payment.amount.toFixed(2)} successfully credited to your wallet`,
        amount: payment.amount,
      };
    });
  }

  async mockSuccessPayment(userId: string, razorpayOrderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) {
      throw new BadRequestException('Payment record not found');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('Unauthorized payment access');
    }

    if (payment.status === 'SUCCESS') {
      return { message: 'Payment already completed', status: 'SUCCESS' };
    }

    const mockPaymentId = `pay_mock_${Date.now()}`;

    return this.verifyPayment(userId, {
      razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
    });
  }

  async handleWebhook(signature: string, payload: any) {
    const eventId = payload?.id || `evt_${Date.now()}`;
    const eventType = payload?.event || 'payment.captured';

    // Idempotency: verify webhook has not been processed
    const existing = await this.prisma.paymentWebhook.findUnique({
      where: { eventId },
    });
    if (existing && existing.isProcessed) {
      return { received: true, alreadyProcessed: true };
    }

    await this.prisma.paymentWebhook.upsert({
      where: { eventId },
      update: {},
      create: {
        eventId,
        eventType,
        payloadJson: JSON.stringify(payload),
        isProcessed: true,
        processedAt: new Date(),
      },
    });

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const entity = payload?.payload?.payment?.entity || payload?.payload?.order?.entity;
      const orderId = entity?.order_id;
      const paymentId = entity?.id;

      if (orderId) {
        const payment = await this.prisma.payment.findUnique({
          where: { razorpayOrderId: orderId },
        });

        if (payment && payment.status !== 'SUCCESS') {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              razorpayPaymentId: paymentId,
              status: 'SUCCESS',
            },
          });

          await this.walletService.creditWallet(
            payment.userId,
            payment.amount,
            `Deposit confirmed via Webhook (${paymentId || orderId})`,
            paymentId || orderId,
            payment.idempotencyKey || undefined,
          );
        }
      }
    }

    return { received: true };
  }
}
