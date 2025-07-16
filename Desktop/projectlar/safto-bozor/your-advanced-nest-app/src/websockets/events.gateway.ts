import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service'; // RedisService ni import qilish
import Redis from 'ioredis'; // Redis tipini import qilish

@WebSocketGateway({
  cors: {
    origin: '*', // Ishlab chiqarishda aniq domenlarni belgilash tavsiya etiladi
    credentials: true,
  },
})
export class EventsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private subscriberClient: Redis; // Pub/Sub uchun alohida Redis klienti

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    // Pub/Sub uchun alohida Redis klientini yaratish
    this.subscriberClient = this.redisService.getClient().duplicate();

    // Kanallarga obuna bo'lish
    this.subscriberClient.subscribe('newSale', 'stockUpdate', 'debtorUpdate', (err, count) => {
      if (err) {
        console.error('Redisga obuna bo\'lishda xato:', err);
      } else {
        console.log(`Redis ${count} ta kanalga obuna bo'ldi.`);
      }
    });

    // Redisdan xabarlarni tinglash
    this.subscriberClient.on('message', (channel, message) => {
      console.log(`Redisdan xabar keldi: Kanal - ${channel}, Xabar - ${message}`);
      // Kelgan xabarni barcha ulangan klientlarga yuborish
      this.server.emit(channel, JSON.parse(message));
    });

    console.log('WebSocket Gateway ishga tushdi.');
  }

  // Misol: Klientdan kelgan xabarni qayta ishlash
  @SubscribeMessage('messageToServer')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): void {
    console.log(`Klientdan xabar: ${data}`);
    // Klientga javob yuborish
    client.emit('messageToClient', `Sizning xabaringiz qabul qilindi: ${data}`);
  }

  // Yangi klient ulanganida
  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Klient ulandi: ${client.id}`);
    // Klientga salom xabari yuborish
    client.emit('connected', 'Serverga muvaffaqiyatli ulandingiz!');
  }

  // Klient uzilganida
  handleDisconnect(client: Socket) {
    console.log(`Klient uzildi: ${client.id}`);
  }

  // Barcha ulangan klientlarga xabar yuborish uchun umumiy metod
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
