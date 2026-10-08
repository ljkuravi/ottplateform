import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'subvault_super_secret_jwt_access_token_key_2026_x87b92q',
      });

      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
      this.logger.log(`WebSocket client connected: user ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WebSocket client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chat:join')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    if (data?.chatId) {
      client.join(`chat:${data.chatId}`);
    }
  }

  @SubscribeMessage('chat:leave')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string }) {
    if (data?.chatId) {
      client.leave(`chat:${data.chatId}`);
    }
  }

  @SubscribeMessage('chat:typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string; isTyping: boolean }) {
    client.to(`chat:${data.chatId}`).emit('chat:userTyping', {
      chatId: data.chatId,
      userId: client.data.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('chat:message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; text: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !data.chatId || !data.text) return;

    try {
      const message = await this.chatService.sendMessage(userId, data.chatId, data.text);
      this.server.to(`chat:${data.chatId}`).emit('chat:newMessage', message);
      return message;
    } catch (err: any) {
      client.emit('chat:error', { message: err.message });
    }
  }
}
