import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateListingDto, UpdateListingDto, AddInventoryDto } from './dto/listing.dto';
import { encryptData } from '../../common/crypto.utils';
import { ListingStatus, Prisma } from '@prisma/client';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    platform?: string;
    minPrice?: number;
    maxPrice?: number;
    duration?: number;
    accessType?: any;
    quality?: string;
    verifiedOnly?: boolean;
    sortBy?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { planName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { platform: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.platform) {
      where.platform = { slug: query.platform };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) where.price.lte = Number(query.maxPrice);
    }

    if (query.duration) {
      where.durationMonths = Number(query.duration);
    }

    if (query.accessType) {
      where.accessType = query.accessType;
    }

    if (query.quality) {
      where.quality = { contains: query.quality, mode: 'insensitive' };
    }

    if (query.verifiedOnly) {
      where.seller = { isVerified: true };
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (query.sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (query.sortBy === 'rating') {
      orderBy = { seller: { rating: 'desc' } };
    } else if (query.sortBy === 'popular') {
      orderBy = { seller: { totalSales: 'desc' } };
    }

    const [total, listings] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          platform: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          seller: {
            select: {
              id: true,
              displayName: true,
              rating: true,
              isVerified: true,
              totalSales: true,
            },
          },
        },
      }),
    ]);

    return {
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFeatured() {
    return this.prisma.listing.findMany({
      where: {
        status: ListingStatus.ACTIVE,
        isFeatured: true,
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        platform: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        seller: {
          select: {
            id: true,
            displayName: true,
            rating: true,
            isVerified: true,
            totalSales: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { slug },
      include: {
        platform: true,
        category: true,
        seller: {
          include: {
            user: { select: { createdAt: true } },
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            buyer: { select: { fullName: true, avatarUrl: true } },
          },
        },
        _count: {
          select: {
            inventory: { where: { isAssigned: false } },
            reviews: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with slug "${slug}" not found`);
    }

    return listing;
  }

  async createListing(userId: string, dto: CreateListingDto) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile || sellerProfile.status !== 'APPROVED') {
      throw new ForbiddenException('Only approved sellers can create listings');
    }

    const baseSlug = `${dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;

    return this.prisma.$transaction(async (tx) => {
      const listing = await tx.listing.create({
        data: {
          sellerId: sellerProfile.id,
          categoryId: dto.categoryId,
          platformId: dto.platformId,
          title: dto.title,
          slug: baseSlug,
          planName: dto.planName,
          description: dto.description,
          durationMonths: dto.durationMonths,
          price: dto.price,
          originalPrice: dto.originalPrice,
          accessType: dto.accessType,
          accountType: dto.accountType || (dto.accessType === 'PRIVATE_ACCOUNT' ? 'Private' : 'Shared'),
          deviceLimit: dto.deviceLimit,
          quality: dto.quality,
          region: dto.region,
          terms: dto.terms,
          instructions: dto.instructions,
          availableStock: dto.inventory?.length || 0,
          totalStock: dto.inventory?.length || 0,
          status: ListingStatus.ACTIVE,
        },
      });

      if (dto.inventory && dto.inventory.length > 0) {
        for (const slot of dto.inventory) {
          const encrypted = encryptData(slot.credentials);
          await tx.listingInventory.create({
            data: {
              listingId: listing.id,
              accountEmailOrId: slot.accountEmailOrId,
              encryptedCredentials: encrypted,
              notes: slot.notes,
              isAssigned: false,
            },
          });
        }
      }

      return listing;
    });
  }

  async updateListing(userId: string, id: string, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.seller.userId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    return this.prisma.listing.update({
      where: { id },
      data: dto,
    });
  }

  async addInventory(userId: string, id: string, dto: AddInventoryDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.seller.userId !== userId) {
      throw new ForbiddenException('You can only modify inventory for your own listings');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const slot of dto.slots) {
        const encrypted = encryptData(slot.credentials);
        await tx.listingInventory.create({
          data: {
            listingId: id,
            accountEmailOrId: slot.accountEmailOrId,
            encryptedCredentials: encrypted,
            notes: slot.notes,
            isAssigned: false,
          },
        });
      }

      const availableCount = await tx.listingInventory.count({
        where: { listingId: id, isAssigned: false },
      });

      const totalCount = await tx.listingInventory.count({
        where: { listingId: id },
      });

      return tx.listing.update({
        where: { id },
        data: {
          availableStock: availableCount,
          totalStock: totalCount,
          status: availableCount > 0 && listing.status === ListingStatus.SOLD_OUT ? ListingStatus.ACTIVE : undefined,
        },
      });
    });
  }

  async deleteListing(userId: string, id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.seller.userId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.listingInventory.deleteMany({ where: { listingId: id } });
      await tx.cartItem.deleteMany({ where: { listingId: id } });
      return tx.listing.delete({ where: { id } });
    });
  }
}
