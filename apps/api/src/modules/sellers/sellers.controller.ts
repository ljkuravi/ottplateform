import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SellersService } from './sellers.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Sellers')
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get('dashboard')
  @Roles(RoleType.SELLER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full seller analytics dashboard data' })
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.sellersService.getDashboard(userId);
  }

  @Patch('profile')
  @Roles(RoleType.SELLER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seller profile details' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: { fullName?: string; phone?: string; bio?: string; avatarUrl?: string },
  ) {
    return this.sellersService.updateProfile(userId, dto);
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get public seller storefront profile with listings and reviews' })
  async getPublicProfile(@Param('idOrSlug') idOrSlug: string) {
    return this.sellersService.getPublicProfile(idOrSlug);
  }
}
