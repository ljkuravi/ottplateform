import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType, ApplicationStatus, ListingStatus } from '@prisma/client';

@ApiTags('Admin Operations')
@ApiBearerAuth()
@Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get complete platform KPI and administrative analytics' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({ summary: 'List and filter all registered users' })
  async getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Suspend, ban, or modify user account permissions' })
  async updateUserStatus(
    @CurrentUser('id') adminId: string,
    @CurrentUser('email') adminEmail: string,
    @Param('id') userId: string,
    @Body() body: { isSuspended?: boolean; isBanned?: boolean; role?: RoleType },
  ) {
    return this.adminService.updateUserStatus(adminId, adminEmail, userId, body);
  }

  @Get('seller-applications')
  @ApiOperation({ summary: 'List seller registration applications' })
  async getApplications(@Query('status') status?: ApplicationStatus) {
    return this.adminService.getSellerApplications(status);
  }

  @Post('seller-applications/:id/review')
  @ApiOperation({ summary: 'Approve or reject a seller application' })
  async reviewApplication(
    @CurrentUser('id') adminId: string,
    @CurrentUser('email') adminEmail: string,
    @Param('id') applicationId: string,
    @Body() body: { action: 'APPROVE' | 'REJECT'; rejectionReason?: string },
  ) {
    return this.adminService.reviewSellerApplication(adminId, adminEmail, applicationId, body);
  }

  @Get('listings')
  @ApiOperation({ summary: 'List all marketplace listings across all sellers' })
  async getListings(@Query() query: any) {
    return this.adminService.getAdminListings(query);
  }

  @Patch('listings/:id')
  @ApiOperation({ summary: 'Admin moderation of listing status and featured badge' })
  async updateListing(
    @CurrentUser('id') adminId: string,
    @CurrentUser('email') adminEmail: string,
    @Param('id') id: string,
    @Body() body: { status?: ListingStatus; isFeatured?: boolean },
  ) {
    return this.adminService.updateListingAdmin(adminId, adminEmail, id, body);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List all marketplace orders with platform fees and earnings breakdown' })
  async getOrders(@Query() query: any) {
    return this.adminService.getAdminOrders(query);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'List seller payout/withdrawal requests' })
  async getWithdrawals() {
    return this.adminService.getWithdrawals();
  }

  @Post('withdrawals/:id/review')
  @ApiOperation({ summary: 'Process or reject seller withdrawal request' })
  async reviewWithdrawal(
    @CurrentUser('id') adminId: string,
    @CurrentUser('email') adminEmail: string,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT'; referenceId?: string; rejectionReason?: string },
  ) {
    return this.adminService.reviewWithdrawal(adminId, adminEmail, id, body);
  }

  @Get('refunds')
  @ApiOperation({ summary: 'List buyer disputes and refund claims' })
  async getRefunds() {
    return this.adminService.getRefunds();
  }

  @Post('refunds/:id/review')
  @ApiOperation({ summary: 'Approve or reject refund dispute with atomic wallet reversal' })
  async reviewRefund(
    @CurrentUser('id') adminId: string,
    @CurrentUser('email') adminEmail: string,
    @Param('id') id: string,
    @Body() body: { action: 'APPROVE' | 'REJECT'; rejectionReason?: string },
  ) {
    return this.adminService.reviewRefund(adminId, adminEmail, id, body);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'View immutable security and administrative audit trail' })
  async getAuditLogs(@Query() query: any) {
    return this.adminService.getAuditLogs(query);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get platform configurable parameters' })
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings/:key')
  @ApiOperation({ summary: 'Update system setting key' })
  async updateSetting(@Param('key') key: string, @Body() body: { value: string }) {
    return this.adminService.updateSetting(key, body.value);
  }
}
