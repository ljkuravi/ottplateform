import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Atomic purchase of a listing using buyer wallet balance' })
  async purchase(@CurrentUser('id') userId: string, @Body() body: { listingId: string }) {
    return this.ordersService.purchaseListing(userId, body.listingId);
  }

  @Get()
  @ApiOperation({ summary: 'Get current buyer orders history' })
  async getBuyerOrders(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.ordersService.getBuyerOrders(userId, query);
  }

  @Get('seller')
  @Roles(RoleType.SELLER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get orders received by the authenticated seller' })
  async getSellerOrders(@CurrentUser('id') userId: string, @Query() query: any) {
    return this.ordersService.getSellerOrders(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details with decrypted credentials for buyer/seller/admin' })
  async getOrderDetails(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: RoleType,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.getOrderDetails(userId, userRole, orderId);
  }
}
