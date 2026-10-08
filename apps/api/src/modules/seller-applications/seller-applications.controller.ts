import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SellerApplicationsService } from './seller-applications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Seller Applications')
@ApiBearerAuth()
@Controller('seller-applications')
export class SellerApplicationsController {
  constructor(private readonly service: SellerApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an application to become a verified seller' })
  async submitApplication(
    @CurrentUser('id') userId: string,
    @Body() body: {
      fullName: string;
      email: string;
      phone: string;
      displayName: string;
      aboutSeller: string;
      payoutMethod: string;
      upiId?: string;
      bankDetails?: string;
    },
  ) {
    return this.service.submitApplication(userId, body);
  }

  @Get('my-status')
  @ApiOperation({ summary: 'Check current user seller application status' })
  async getMyStatus(@CurrentUser('id') userId: string) {
    return this.service.getMyApplication(userId);
  }
}
