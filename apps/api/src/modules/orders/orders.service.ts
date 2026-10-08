import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { decryptData } from '../../common/crypto.utils';
import { OrderStatus, TransactionType, TransactionStatus, RoleType, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  async purchaseListing(buyerId: string, listingId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. Verify authenticated buyer
        const buyer = await tx.user.findUnique({
          where: { id: buyerId },
          include: { wallet: true },
        });

        if (!buyer) {
          throw new NotFoundException('Buyer account not found');
        }

        if (buyer.isSuspended || buyer.isBanned) {
          throw new ForbiddenException('Buyer account is restricted');
        }

        // 2 & 3. Verify listing & seller
        const listing = await tx.listing.findUnique({
          where: { id: listingId },
          include: {
            seller: {
              include: {
                sellerWallet: true,
                user: true,
              },
            },
          },
        });

        if (!listing) {
          throw new NotFoundException('Listing not found');
        }

        if (listing.status !== 'ACTIVE') {
          throw new BadRequestException('This listing is no longer active or is sold out');
        }

        if (listing.seller.status !== 'APPROVED') {
          throw new BadRequestException('Seller is not currently active');
        }

        if (listing.seller.userId === buyerId) {
          throw new BadRequestException('Sellers cannot purchase their own listings');
        }

        // 4. Check available inventory slot
        const availableSlot = await tx.listingInventory.findFirst({
          where: {
            listingId: listing.id,
            isAssigned: false,
          },
          orderBy: { createdAt: 'asc' },
        });

        if (!availableSlot) {
          // Mark listing sold out
          await tx.listing.update({
            where: { id: listing.id },
            data: { status: 'SOLD_OUT', availableStock: 0 },
          });
          throw new BadRequestException('Sorry, this subscription has just sold out!');
        }

        // 5 & 6. Calculate pricing and platform fee
        const itemPrice = listing.price;
        const feeSetting = await tx.systemSetting.findUnique({
          where: { key: 'PLATFORM_COMMISSION_PERCENT' },
        });
        const commissionPercent = feeSetting ? parseFloat(feeSetting.value) : 10;
        const platformFee = Math.round((itemPrice * (commissionPercent / 100)) * 100) / 100;
        const sellerEarning = Math.round((itemPrice - platformFee) * 100) / 100;

        // 7. Verify buyer wallet balance
        const currentBalance = buyer.wallet?.balance || 0;
        if (currentBalance < itemPrice) {
          const shortage = (itemPrice - currentBalance).toFixed(2);
          throw new BadRequestException(
            `Insufficient wallet balance. You have ₹${currentBalance.toFixed(2)}, need ₹${itemPrice.toFixed(2)}. Add ₹${shortage} to continue.`,
          );
        }

        // 8 & 9. Deduct buyer wallet
        const newBuyerBalance = currentBalance - itemPrice;
        await tx.wallet.update({
          where: { id: buyer.wallet!.id },
          data: {
            balance: newBuyerBalance,
            totalSpent: (buyer.wallet?.totalSpent || 0) + itemPrice,
          },
        });

        // 10. Generate order number
        const orderNumber = `SUB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + listing.durationMonths);

        // 11. Create Order
        const order = await tx.order.create({
          data: {
            orderNumber,
            buyerId,
            sellerId: listing.seller.id,
            totalAmount: itemPrice,
            platformFee,
            sellerEarning,
            status: OrderStatus.DELIVERED,
            deliveryNotes: `Instant digital delivery allocated: ${listing.planName} (${listing.durationMonths} Month(s)).`,
            encryptedDeliveryData: availableSlot.encryptedCredentials,
            expiresAt,
          },
        });

        // 12. Reserve inventory slot
        await tx.listingInventory.update({
          where: { id: availableSlot.id },
          data: {
            isAssigned: true,
            assignedToOrderId: order.id,
            assignedAt: new Date(),
          },
        });

        // Update listing available stock
        const remainingStock = await tx.listingInventory.count({
          where: { listingId: listing.id, isAssigned: false },
        });

        await tx.listing.update({
          where: { id: listing.id },
          data: {
            availableStock: remainingStock,
            status: remainingStock === 0 ? 'SOLD_OUT' : 'ACTIVE',
          },
        });

        // 13. Create OrderItem
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            listingId: listing.id,
            listingTitle: listing.title,
            planName: listing.planName,
            durationMonths: listing.durationMonths,
            unitPrice: itemPrice,
            quantity: 1,
            encryptedSlotData: availableSlot.encryptedCredentials,
          },
        });

        // 14. Create Seller Earning & update Seller Wallet
        let sellerWallet = listing.seller.sellerWallet;
        if (!sellerWallet) {
          sellerWallet = await tx.sellerWallet.create({
            data: { sellerProfileId: listing.seller.id },
          });
        }

        await tx.sellerEarning.create({
          data: {
            sellerWalletId: sellerWallet.id,
            sellerProfileId: listing.seller.id,
            orderId: order.id,
            grossAmount: itemPrice,
            platformFee,
            netEarning: sellerEarning,
            isReleased: true,
          },
        });

        await tx.sellerWallet.update({
          where: { id: sellerWallet.id },
          data: {
            availableEarnings: sellerWallet.availableEarnings + sellerEarning,
            totalEarnings: sellerWallet.totalEarnings + sellerEarning,
          },
        });

        // Increment seller sales counter
        await tx.sellerProfile.update({
          where: { id: listing.seller.id },
          data: {
            totalSales: listing.seller.totalSales + 1,
            completedOrdersCount: listing.seller.completedOrdersCount + 1,
          },
        });

        // 15. Create Wallet ledger entry
        await tx.walletTransaction.create({
          data: {
            walletId: buyer.wallet!.id,
            userId: buyer.id,
            amount: itemPrice,
            balanceAfter: newBuyerBalance,
            type: TransactionType.DEBIT,
            status: TransactionStatus.SUCCESS,
            description: `Purchased: ${listing.title} (#${orderNumber})`,
            referenceId: order.id,
            idempotencyKey: `ord_${order.id}`,
          },
        });

        // 16. Notifications
        await tx.notification.createMany({
          data: [
            {
              userId: buyer.id,
              type: 'ORDER_DELIVERED',
              title: 'Order Completed & Delivered',
              message: `Your subscription #${orderNumber} for "${listing.title}" is ready. View your access credentials now.`,
              linkUrl: `/orders/${order.id}`,
            },
            {
              userId: listing.seller.userId,
              type: 'ORDER_CREATED',
              title: 'New Order Received',
              message: `You earned ₹${sellerEarning.toFixed(2)} from sale of "${listing.title}" (#${orderNumber}).`,
              linkUrl: `/seller/orders`,
            },
          ],
        });

        // 17. Create Chat thread between Buyer and Seller for this order
        const chat = await tx.chat.create({
          data: {
            orderId: order.id,
            buyerId: buyer.id,
            sellerId: listing.seller.userId,
            lastMessageAt: new Date(),
          },
        });

        await tx.chatParticipant.createMany({
          data: [
            { chatId: chat.id, userId: buyer.id },
            { chatId: chat.id, userId: listing.seller.userId },
          ],
        });

        await tx.message.create({
          data: {
            chatId: chat.id,
            senderId: listing.seller.userId,
            text: `Order #${orderNumber} confirmed! Your access details have been securely delivered. Feel free to message here if you need any assistance!`,
          },
        });

        // 18. Remove from cart if present
        const buyerCart = await tx.cart.findUnique({ where: { userId: buyerId } });
        if (buyerCart) {
          await tx.cartItem.deleteMany({
            where: { cartId: buyerCart.id, listingId: listing.id },
          });
        }

        // 19. Audit Log
        await tx.auditLog.create({
          data: {
            actorId: buyer.id,
            actorEmail: buyer.email,
            action: 'ORDER_PURCHASED',
            entity: 'Order',
            entityId: order.id,
            metadata: JSON.stringify({
              orderNumber,
              amount: itemPrice,
              platformFee,
              sellerEarning,
              seller: listing.seller.displayName,
            }),
          },
        });

        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
          message: 'Order placed and delivered successfully!',
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 15000,
      },
    );
  }

  async getBuyerOrders(buyerId: string, query: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      buyerId,
      ...(query.status ? { status: query.status as OrderStatus } : {}),
    };

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { id: true, displayName: true, rating: true, isVerified: true } },
          items: true,
          review: true,
          refund: true,
        },
      }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSellerOrders(userId: string, query: { page?: number; limit?: number; status?: string }) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new ForbiddenException('Seller profile not found');
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      sellerId: seller.id,
      ...(query.status ? { status: query.status as OrderStatus } : {}),
    };

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, fullName: true, email: true } },
          items: true,
          refund: true,
        },
      }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderDetails(userId: string, userRole: RoleType, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { id: true, fullName: true, email: true, phone: true } },
        seller: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        items: {
          include: {
            listing: {
              include: {
                platform: true,
              },
            },
          },
        },
        review: true,
        refund: true,
        chat: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isBuyer = order.buyerId === userId;
    const isSeller = order.seller.user.id === userId;
    const isAdmin = userRole === RoleType.ADMIN || userRole === RoleType.SUPER_ADMIN;

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new ForbiddenException('Access denied. You do not own this order.');
    }

    // Decrypt credentials for authorized parties
    let decryptedCredentials: string | null = null;
    if (order.encryptedDeliveryData) {
      try {
        decryptedCredentials = decryptData(order.encryptedDeliveryData);
      } catch (err: any) {
        this.logger.error(`Failed to decrypt order credentials for ${orderId}: ${err.message}`);
        decryptedCredentials = 'Error loading credentials. Please contact seller or support.';
      }
    }

    return {
      ...order,
      decryptedDeliveryData: decryptedCredentials,
    };
  }
}
