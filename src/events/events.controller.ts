import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { User } from './entities/user.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return this.eventsService.create(createEventDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.eventsService.remove(id);
  }

  @Post('merge-all/:userId')
  mergeAllOverlappingEvents(@Param('userId') userId: string): Promise<Event[]> {
    return this.eventsService.mergeAllOverlappingEvents(userId);
  }

  // Helper endpoints for testing
  @Post('users')
  createUser(@Body('name') name: string): Promise<User> {
    return this.eventsService.createUser(name);
  }

  @Get('users/all')
  findAllUsers(): Promise<User[]> {
    return this.eventsService.findAllUsers();
  }
}