import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { User } from './entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const { inviteeIds, ...eventData } = createEventDto;

    // Validate start and end times
    const startTime = new Date(createEventDto.startTime);
    const endTime = new Date(createEventDto.endTime);
    
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Find invitees
    const invitees = await this.userRepository.findByIds(inviteeIds);
    if (invitees.length !== inviteeIds.length) {
      throw new NotFoundException('One or more invitees not found');
    }

    const event = this.eventRepository.create({
      ...eventData,
      startTime,
      endTime,
      invitees,
    });

    return this.eventRepository.save(event);
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['invitees'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  async mergeAllOverlappingEvents(userId: string): Promise<Event[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['events'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const userEvents = await this.eventRepository.find({
      where: { invitees: { id: userId } },
      relations: ['invitees'],
      order: { startTime: 'ASC' },
    });

    if (userEvents.length <= 1) {
      return userEvents;
    }

    const mergedEvents: Event[] = [];
    const toDelete: Event[] = [];
    let currentGroup: Event[] = [userEvents[0]];

    for (let i = 1; i < userEvents.length; i++) {
      const currentEvent = userEvents[i];
      const lastEventInGroup = currentGroup[currentGroup.length - 1];

      // Check if events overlap
      if (this.doEventsOverlap(lastEventInGroup, currentEvent)) {
        currentGroup.push(currentEvent);
      } else {
        // Process the current group if it has more than one event
        if (currentGroup.length > 1) {
          const merged = await this.mergeEventGroup(currentGroup);
          mergedEvents.push(merged);
          toDelete.push(...currentGroup);
        } else {
          mergedEvents.push(currentGroup[0]);
        }
        currentGroup = [currentEvent];
      }
    }

    // Process the last group
    if (currentGroup.length > 1) {
      const merged = await this.mergeEventGroup(currentGroup);
      mergedEvents.push(merged);
      toDelete.push(...currentGroup);
    } else {
      mergedEvents.push(currentGroup[0]);
    }

    // Remove old events
    if (toDelete.length > 0) {
      await this.eventRepository.remove(toDelete);
    }

    return mergedEvents;
  }

  private doEventsOverlap(event1: Event, event2: Event): boolean {
    return event1.endTime > event2.startTime && event1.startTime < event2.endTime;
  }

  private async mergeEventGroup(events: Event[]): Promise<Event> {
    const earliestStart = events.reduce((earliest, event) => 
      event.startTime < earliest ? event.startTime : earliest, 
      events[0].startTime
    );

    const latestEnd = events.reduce((latest, event) => 
      event.endTime > latest ? event.endTime : latest, 
      events[0].endTime
    );

    // Merge titles and descriptions
    const mergedTitle = events.map(e => e.title).join(' + ');
    const mergedDescription = events
      .map(e => e.description)
      .filter(desc => desc)
      .join(' | ');

    // Determine status priority: IN_PROGRESS > TODO > COMPLETED
    const statusPriority = {
      [EventStatus.IN_PROGRESS]: 3,
      [EventStatus.TODO]: 2,
      [EventStatus.COMPLETED]: 1,
    };

    const mergedStatus = events.reduce((highestStatus, event) => 
      statusPriority[event.status] > statusPriority[highestStatus] 
        ? event.status 
        : highestStatus,
      EventStatus.COMPLETED
    );

    // Collect all unique invitees
    const allInvitees = new Map<string, User>();
    events.forEach(event => {
      event.invitees.forEach(invitee => {
        allInvitees.set(invitee.id, invitee);
      });
    });

    const mergedEvent = this.eventRepository.create({
      title: mergedTitle,
      description: mergedDescription,
      status: mergedStatus,
      startTime: earliestStart,
      endTime: latestEnd,
      invitees: Array.from(allInvitees.values()),
    });

    return this.eventRepository.save(mergedEvent);
  }

  // Helper method to create users for testing
  async createUser(name: string): Promise<User> {
    const user = this.userRepository.create({ name });
    return this.userRepository.save(user);
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find({ relations: ['events'] });
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['events'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.findUserById(id);
    await this.userRepository.remove(user);
  }
}