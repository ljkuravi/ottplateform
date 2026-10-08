import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@prisma/client';

@ApiTags('Seller Withdrawals')
@ApiBearerAuth()
@Roles(RoleType.SELLER, RoleType.ADMIN, RoleType.SUPER_ADMIN)
@Controller('seller/withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Get seller earnings, wallet balances, and payout history' })
  async getWallet(@CurrentUser('id') userId: string) {
    return this.withdrawalsService.getSellerWallet(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of withdrawal requests submitted by seller' })
  async getWithdrawals(@CurrentUser('id') userId: string) {
    return this.withdrawalsService.getSellerWithdrawals(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new withdrawal request for available earnings' })
  async requestWithdrawal(
    @CurrentUser('id') userId: string,
    @Body() body: { amount: number; payoutMethod: string; payoutDetails: string },
  ) {
    return this.withdrawalsService.requestWithdrawal(userId, body);
  }
}
