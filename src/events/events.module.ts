import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { User } from './entities/user.entity';
import {UsersController} from "./users.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Event, User])],
  controllers: [EventsController, UsersController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}