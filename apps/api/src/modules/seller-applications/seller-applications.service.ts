import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class SellerApplicationsService {
  constructor(private prisma: PrismaService) {}

  async submitApplication(userId: string, data: {
    fullName: string;
    email: string;
    phone: string;
    displayName: string;
    aboutSeller: string;
    payoutMethod: string;
    upiId?: string;
    bankDetails?: string;
  }) {
    const existingApplication = await this.prisma.sellerApplication.findUnique({
      where: { userId },
    });

    if (existingApplication && existingApplication.status === 'PENDING') {
      throw new BadRequestException('You already have a pending seller application under review.');
    }

    if (existingApplication && existingApplication.status === 'APPROVED') {
      throw new BadRequestException('You are already an approved seller.');
    }

    // Check display name uniqueness across seller profiles
    const existingProfile = await this.prisma.sellerProfile.findUnique({
      where: { displayName: data.displayName.trim() },
    });
    if (existingProfile && existingProfile.userId !== userId) {
      throw new BadRequestException('Seller display name is already taken. Please choose another.');
    }

    const application = await this.prisma.sellerApplication.upsert({
      where: { userId },
      update: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        displayName: data.displayName.trim(),
        aboutSeller: data.aboutSeller,
        payoutMethod: data.payoutMethod,
        upiId: data.upiId,
        bankDetails: data.bankDetails,
        status: 'PENDING',
        rejectionReason: null,
      },
      create: {
        userId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        displayName: data.displayName.trim(),
        aboutSeller: data.aboutSeller,
        payoutMethod: data.payoutMethod,
        upiId: data.upiId,
        bankDetails: data.bankDetails,
        status: 'PENDING',
      },
    });

    // Notify admins
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    });

    for (const a of admins) {
      await this.prisma.notification.create({
        data: {
          userId: a.id,
          type: 'SELLER_APPLICATION',
          title: 'New Seller Application',
          message: `${data.displayName} has applied to become a seller.`,
          linkUrl: '/admin/sellers',
        },
      });
    }

    return {
      message: 'Seller application submitted successfully. Admin will review your profile shortly.',
      application,
    };
  }

  async getMyApplication(userId: string) {
    const application = await this.prisma.sellerApplication.findUnique({
      where: { userId },
    });
    return application;
  }
}
