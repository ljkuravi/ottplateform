import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate Razorpay payment order for wallet deposit' })
  async createPaymentOrder(@CurrentUser('id') userId: string, @Body() body: { amount: number }) {
    return this.paymentsService.createPaymentOrder(userId, Number(body.amount));
  }

  @Post('verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay payment and atomically credit buyer wallet' })
  async verifyPayment(
    @CurrentUser('id') userId: string,
    @Body() body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature?: string },
  ) {
    return this.paymentsService.verifyPayment(userId, body);
  }

  @Post('mock-success')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sandbox simulator to instantly complete deposit for testing/demo' })
  async mockSuccess(@CurrentUser('id') userId: string, @Body() body: { razorpayOrderId: string }) {
    return this.paymentsService.mockSuccessPayment(userId, body.razorpayOrderId);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Razorpay webhook receiver with idempotency' })
  async handleWebhook(@Headers('x-razorpay-signature') signature: string, @Body() payload: any) {
    return this.paymentsService.handleWebhook(signature, payload);
  }
}
