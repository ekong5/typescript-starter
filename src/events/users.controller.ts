import { Controller, Get, Post, Body } from '@nestjs/common';
import { EventsService } from './events.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() createUserDto: { name: string }): Promise<User> {
    return this.eventsService.createUser(createUserDto.name);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.eventsService.findAllUsers();
  }
}