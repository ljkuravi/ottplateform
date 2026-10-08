import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            listing: {
              include: {
                platform: true,
                seller: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              listing: {
                include: {
                  platform: true,
                  seller: true,
                },
              },
            },
          },
        },
      });
    }

    // Calculate live total based on current database listing prices
    let total = 0;
    const validatedItems = cart.items.map((item) => {
      const isAvailable = item.listing.status === 'ACTIVE' && item.listing.availableStock >= item.quantity;
      if (isAvailable) {
        total += item.listing.price * item.quantity;
      }
      return {
        ...item,
        isAvailable,
      };
    });

    return {
      id: cart.id,
      items: validatedItems,
      subtotal: total,
      totalAmount: total,
      itemCount: cart.items.length,
    };
  }

  async addItem(userId: string, listingId: string, quantity: number = 1) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      throw new BadRequestException('Listing is not currently active');
    }

    if (listing.availableStock < 1) {
      throw new BadRequestException('Listing is currently sold out');
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_listingId: {
          cartId: cart.id,
          listingId,
        },
      },
    });

    if (existingItem) {
      return this.getCart(userId);
    }

    await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        listingId,
        quantity: Math.min(1, quantity), // Subscriptions are normally 1 per item
      },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, cartItemId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { message: 'Cart cleared' };
  }
}
