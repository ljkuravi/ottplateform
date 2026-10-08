import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(buyerId: string, data: { orderId: string; rating: number; title?: string; comment?: string }) {
    const rating = Math.max(1, Math.min(5, Number(data.rating)));

    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        items: true,
        review: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyerId !== buyerId) {
      throw new BadRequestException('You can only review your own orders');
    }

    if (order.review) {
      throw new BadRequestException('A review has already been submitted for this order');
    }

    const listingId = order.items[0]?.listingId;
    if (!listingId) {
      throw new BadRequestException('No items associated with order');
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          orderId: order.id,
          listingId,
          buyerId,
          sellerProfileId: order.sellerId,
          rating,
          title: data.title,
          comment: data.comment,
        },
      });

      // Recalculate seller average rating
      const sellerReviews = await tx.review.findMany({
        where: { sellerProfileId: order.sellerId },
        select: { rating: true },
      });

      const totalRatingSum = sellerReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Math.round((totalRatingSum / sellerReviews.length) * 10) / 10;

      await tx.sellerProfile.update({
        where: { id: order.sellerId },
        data: {
          rating: avgRating,
          totalRatingsCount: sellerReviews.length,
        },
      });

      return review;
    });
  }
}
