import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit rating and feedback for completed order' })
  async createReview(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string; rating: number; title?: string; comment?: string },
  ) {
    return this.reviewsService.createReview(userId, body);
  }
}
