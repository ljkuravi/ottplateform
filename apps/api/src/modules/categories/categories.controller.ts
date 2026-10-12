import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Categories & Platforms')
@Controller('categories')
export class CategoriesController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active subscription categories with platform counts' })
  async getCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        platforms: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            _count: {
              select: {
                listings: {
                  where: { status: 'ACTIVE' },
                },
              },
            },
          },
        },
        _count: {
          select: {
            listings: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });
  }

  @Public()
  @Get('platforms')
  @ApiOperation({ summary: 'List all platforms across all categories' })
  async getAllPlatforms() {
    return this.prisma.platform.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            listings: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  @Public()
  @Get('plans-config')
  @ApiOperation({ summary: 'Get configured platform plans, account types, and templates' })
  async getPlansConfig() {
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key: 'PLATFORM_PLANS_CONFIG' },
      });
      if (setting && setting.value) {
        return JSON.parse(setting.value);
      }
    } catch {
      // fallback
    }

    return {
      'prime-video': {
        name: 'Amazon Prime Video',
        durations: {
          '1': { minPrice: 30, maxPrice: 300 },
          '3': { minPrice: 80, maxPrice: 800 },
          '6': { minPrice: 150, maxPrice: 1500 },
          '12': { minPrice: 280, maxPrice: 2800 },
        },
        categories: [
          'Full HD 1080',
          'HD 720 Quality',
          'Individual Plan',
          'Family Plan',
          '4K Video Quality',
        ],
      },
      'netflix': {
        name: 'Netflix',
        durations: {
          '1': { minPrice: 60, maxPrice: 600 },
          '3': { minPrice: 160, maxPrice: 1600 },
          '6': { minPrice: 300, maxPrice: 3000 },
          '12': { minPrice: 550, maxPrice: 5500 },
        },
        categories: [
          'Shared Screen 4K',
          'Private Profile with PIN',
          'Full Dedicated Account (4 Screens)',
          'Mobile Plan (HD)',
          'Standard 1080p',
        ],
      },
      'youtube-premium': {
        name: 'YouTube Premium',
        durations: {
          '1': { minPrice: 25, maxPrice: 250 },
          '3': { minPrice: 60, maxPrice: 600 },
          '6': { minPrice: 110, maxPrice: 1100 },
          '12': { minPrice: 200, maxPrice: 2000 },
        },
        categories: [
          'Individual Plan',
          'Invitation Plan',
          'Family Group',
          'Student Plan',
        ],
      },
      'spotify-premium': {
        name: 'Spotify Premium',
        durations: {
          '1': { minPrice: 20, maxPrice: 200 },
          '3': { minPrice: 50, maxPrice: 500 },
          '6': { minPrice: 90, maxPrice: 900 },
          '12': { minPrice: 170, maxPrice: 1700 },
        },
        categories: [
          'Individual Plan',
          'Invitation Plan',
          'Duo Plan Slot',
          'Family Group Owner',
        ],
      },
      'hotstar': {
        name: 'Disney+ Hotstar',
        durations: {
          '1': { minPrice: 35, maxPrice: 350 },
          '3': { minPrice: 90, maxPrice: 900 },
          '6': { minPrice: 170, maxPrice: 1700 },
          '12': { minPrice: 300, maxPrice: 3000 },
        },
        categories: [
          'Super Plan (Shared 1 Device)',
          'Premium 4K (Private Profile)',
          'Premium Dedicated Account',
        ],
      },
      'chatgpt-plus': {
        name: 'ChatGPT Plus',
        durations: {
          '1': { minPrice: 150, maxPrice: 1500 },
          '3': { minPrice: 400, maxPrice: 4000 },
          '6': { minPrice: 750, maxPrice: 7500 },
          '12': { minPrice: 1400, maxPrice: 14000 },
        },
        categories: [
          'Team Workspace Member Slot',
          'Shared Pro Slot',
          'Dedicated Private Account',
        ],
      },
      'canva-pro': {
        name: 'Canva Pro',
        durations: {
          '1': { minPrice: 20, maxPrice: 200 },
          '3': { minPrice: 50, maxPrice: 500 },
          '6': { minPrice: 90, maxPrice: 900 },
          '12': { minPrice: 150, maxPrice: 1500 },
        },
        categories: [
          'Team Invite Link',
          'Dedicated Private Account',
          'Lifetime Education Slot',
        ],
      },
    };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug with associated platforms' })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        platforms: {
          where: { isActive: true },
        },
      },
    });
  }
}
