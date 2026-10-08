import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart with live price and stock validation' })
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a listing item to cart' })
  async addItem(@CurrentUser('id') userId: string, @Body() body: { listingId: string; quantity?: number }) {
    return this.cartService.addItem(userId, body.listingId, body.quantity || 1);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from cart' })
  async removeItem(@CurrentUser('id') userId: string, @Param('id') cartItemId: string) {
    return this.cartService.removeItem(userId, cartItemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from cart' })
  async clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
