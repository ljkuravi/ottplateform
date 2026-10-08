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
