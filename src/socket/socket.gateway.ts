import { Server, Socket } from 'socket.io';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { RedisCacheService } from '../cache/redisCache.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private redisCacheService: RedisCacheService) {}

  async handleConnection(socket: Socket, ...args: any[]): Promise<any> {
    const socketId = socket.id;
    const userId = socket.handshake.query.userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    await this.redisCacheService.setUserSession(
      String(userId),
      String(socketId),
    );
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    await this.redisCacheService.delUserBySession(socket.id);
  }
}
