import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getUserChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            buyer: {
              select: { id: true, fullName: true, email: true },
            },
            items: {
              select: {
                id: true,
                listingTitle: true,
                planName: true,
                durationMonths: true,
                unitPrice: true,
                listing: {
                  select: {
                    accessType: true,
                    accountType: true,
                    deviceLimit: true,
                    quality: true,
                    deliveryType: true,
                    platform: {
                      select: { name: true, logoUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true, role: true },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return chats.map((chat) => {
      const otherParticipant = chat.participants.find((p) => p.userId !== userId)?.user;
      const myParticipant = chat.participants.find((p) => p.userId === userId);
      return {
        id: chat.id,
        order: chat.order,
        otherUser: otherParticipant,
        lastMessage: chat.messages[0] || null,
        unreadCount: myParticipant?.unreadCount || 0,
        updatedAt: chat.updatedAt,
      };
    });
  }

  async getChatMessages(userId: string, chatId: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: { chatId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('Access denied. You are not a participant in this conversation.');
    }

    // Reset unread counter for current user
    await this.prisma.chatParticipant.update({
      where: { id: participant.id },
      data: { unreadCount: 0, lastReadAt: new Date() },
    });

    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async sendMessage(userId: string, chatId: string, text: string) {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: { chatId, userId },
      },
    });

    if (!participant) {
      throw new ForbiddenException('Access denied to send messages in this chat.');
    }

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          chatId,
          senderId: userId,
          text: text.trim(),
        },
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      });

      // Update chat lastMessageAt
      await tx.chat.update({
        where: { id: chatId },
        data: { lastMessageAt: new Date(), updatedAt: new Date() },
      });

      // Increment unread count for other participant(s)
      await tx.chatParticipant.updateMany({
        where: {
          chatId,
          userId: { not: userId },
        },
        data: {
          unreadCount: { increment: 1 },
        },
      });

      return message;
    });
  }

  async markAsRead(userId: string, chatId: string) {
    await this.prisma.chatParticipant.updateMany({
      where: { chatId, userId },
      data: { unreadCount: 0, lastReadAt: new Date() },
    });
    return { success: true };
  }
}
