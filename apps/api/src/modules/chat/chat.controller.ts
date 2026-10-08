import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of active conversation threads for current user' })
  async getUserChats(@CurrentUser('id') userId: string) {
    return this.chatService.getUserChats(userId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get message history for a conversation' })
  async getMessages(@CurrentUser('id') userId: string, @Param('id') chatId: string) {
    return this.chatService.getChatMessages(userId, chatId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation thread' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Param('id') chatId: string,
    @Body() body: { text: string },
  ) {
    return this.chatService.sendMessage(userId, chatId, body.text);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark conversation messages as read' })
  async markRead(@CurrentUser('id') userId: string, @Param('id') chatId: string) {
    return this.chatService.markAsRead(userId, chatId);
  }
}
