import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RefundsService } from './refunds.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RefundReason } from '@prisma/client';

@ApiTags('Refunds & Disputes')
@ApiBearerAuth()
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an issue report or refund request for an order' })
  async requestRefund(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string; reason: RefundReason; details: string; evidenceUrl?: string },
  ) {
    return this.refundsService.requestRefund(userId, body);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user refund and dispute requests' })
  async getMyRefunds(@CurrentUser('id') userId: string) {
    return this.refundsService.getMyRefunds(userId);
  }
}
