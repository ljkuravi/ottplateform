import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { CreateListingDto, UpdateListingDto, AddInventoryDto } from './dto/listing.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search and filter active marketplace listings with server-side pagination' })
  async findAll(@Query() query: any) {
    return this.listingsService.findAll(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get curated featured listings for homepage showcase' })
  async getFeatured() {
    return this.listingsService.getFeatured();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get full listing details by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.listingsService.findBySlug(slug);
  }

  @Post()
  @Roles(RoleType.SELLER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription listing (Seller only)' })
  async createListing(@CurrentUser('id') userId: string, @Body() dto: CreateListingDto) {
    return this.listingsService.createListing(userId, dto);
  }

  @Patch(':id')
  @Roles(RoleType.SELLER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update listing fields (Seller only)' })
  async updateListing(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingsService.updateListing(userId, id, dto);
  }

  @Delete(':id')
  @Roles(RoleType.SELLER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete listing (Seller only)' })
  async deleteListing(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.listingsService.deleteListing(userId, id);
  }

  @Post(':id/inventory')
  @Roles(RoleType.SELLER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add encrypted inventory slots to a listing (Seller only)' })
  async addInventory(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddInventoryDto,
  ) {
    return this.listingsService.addInventory(userId, id, dto);
  }
}

