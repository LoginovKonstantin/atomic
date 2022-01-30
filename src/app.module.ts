import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchedulerService } from './scheduler/scheduler.service';
import { RedisCacheModule } from './cache/redisCache.module';
import { SocketGateway } from './socket/socket.gateway';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    RedisCacheModule,
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'client') }),
  ],
  controllers: [AppController],
  providers: [AppService, SchedulerService, SocketGateway],
})
export class AppModule {}
