import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event, EventStatus } from './entities/event.entity';
import { User } from './entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';

describe('EventsService', () => {
  let service: EventsService;
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;

  const mockEventRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findByIds: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createEventDto: CreateEventDto = {
      title: 'Test Event',
      description: 'Test Description',
      status: EventStatus.TODO,
      startTime: '2024-01-01T10:00:00.000Z',
      endTime: '2024-01-01T11:00:00.000Z',
      inviteeIds: ['user1', 'user2'],
    };

    const mockUsers = [
      { id: 'user1', name: 'User 1' },
      { id: 'user2', name: 'User 2' },
    ];

    const mockEvent = {
      id: 'event1',
      title: 'Test Event',
      description: 'Test Description',
      status: EventStatus.TODO,
      startTime: new Date('2024-01-01T10:00:00.000Z'),
      endTime: new Date('2024-01-01T11:00:00.000Z'),
      invitees: mockUsers,
    };

    it('should create an event successfully', async () => {
      mockUserRepository.findByIds.mockResolvedValue(mockUsers);
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockEventRepository.save.mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(mockUserRepository.findByIds).toHaveBeenCalledWith(['user1', 'user2']);
      expect(mockEventRepository.create).toHaveBeenCalledWith({
        title: 'Test Event',
        description: 'Test Description',
        status: EventStatus.TODO,
        startTime: new Date('2024-01-01T10:00:00.000Z'),
        endTime: new Date('2024-01-01T11:00:00.000Z'),
        invitees: mockUsers,
      });
      expect(mockEventRepository.save).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });

    it('should throw BadRequestException when start time is after end time', async () => {
      const invalidDto = {
        ...createEventDto,
        startTime: '2024-01-01T11:00:00.000Z',
        endTime: '2024-01-01T10:00:00.000Z',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        new BadRequestException('Start time must be before end time')
      );
    });

    it('should throw BadRequestException when start time equals end time', async () => {
      const invalidDto = {
        ...createEventDto,
        startTime: '2024-01-01T10:00:00.000Z',
        endTime: '2024-01-01T10:00:00.000Z',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        new BadRequestException('Start time must be before end time')
      );
    });

    it('should throw NotFoundException when invitees not found', async () => {
      mockUserRepository.findByIds.mockResolvedValue([mockUsers[0]]);

      await expect(service.create(createEventDto)).rejects.toThrow(
        new NotFoundException('One or more invitees not found')
      );
    });
  });

  describe('findOne', () => {
    const mockEvent = {
      id: 'event1',
      title: 'Test Event',
      invitees: [{ id: 'user1', name: 'User 1' }],
    };

    it('should return event when found', async () => {
      mockEventRepository.findOne.mockResolvedValue(mockEvent);

      const result = await service.findOne('event1');

      expect(mockEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'event1' },
        relations: ['invitees'],
      });
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException when event not found', async () => {
      mockEventRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        new NotFoundException('Event with ID nonexistent not found')
      );
    });
  });

  describe('remove', () => {
    const mockEvent = { id: 'event1', title: 'Test Event' };

    it('should remove event successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEvent as Event);
      mockEventRepository.remove.mockResolvedValue(undefined);

      await service.remove('event1');

      expect(service.findOne).toHaveBeenCalledWith('event1');
      expect(mockEventRepository.remove).toHaveBeenCalledWith(mockEvent);
    });

    it('should throw NotFoundException when event not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException('Event with ID nonexistent not found')
      );

      await expect(service.remove('nonexistent')).rejects.toThrow(
        new NotFoundException('Event with ID nonexistent not found')
      );
    });
  });

  describe('createUser', () => {
    const mockUser = { id: 'user1', name: 'Test User' };

    it('should create user successfully', async () => {
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser('Test User');

      expect(mockUserRepository.create).toHaveBeenCalledWith({ name: 'Test User' });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should create user with empty name', async () => {
      const userWithEmptyName = { id: 'user2', name: '' };
      mockUserRepository.create.mockReturnValue(userWithEmptyName);
      mockUserRepository.save.mockResolvedValue(userWithEmptyName);

      const result = await service.createUser('');

      expect(mockUserRepository.create).toHaveBeenCalledWith({ name: '' });
      expect(mockUserRepository.save).toHaveBeenCalledWith(userWithEmptyName);
      expect(result).toEqual(userWithEmptyName);
    });

    it('should create user with special characters in name', async () => {
      const specialUser = { id: 'user3', name: 'John O\'Connor @Company' };
      mockUserRepository.create.mockReturnValue(specialUser);
      mockUserRepository.save.mockResolvedValue(specialUser);

      const result = await service.createUser('John O\'Connor @Company');

      expect(mockUserRepository.create).toHaveBeenCalledWith({ name: 'John O\'Connor @Company' });
      expect(mockUserRepository.save).toHaveBeenCalledWith(specialUser);
      expect(result).toEqual(specialUser);
    });

    it('should handle repository save errors', async () => {
      const error = new Error('Database connection failed');
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockRejectedValue(error);

      await expect(service.createUser('Test User')).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('findAllUsers', () => {
    const mockUsers = [
      { id: 'user1', name: 'User 1', events: [] },
      { id: 'user2', name: 'User 2', events: [] },
    ];

    it('should return all users with events', async () => {
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAllUsers();

      expect(mockUserRepository.find).toHaveBeenCalledWith({ relations: ['events'] });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findAllUsers();

      expect(mockUserRepository.find).toHaveBeenCalledWith({ relations: ['events'] });
      expect(result).toEqual([]);
    });
  });

  describe('findUserById', () => {
    const mockUser = {
      id: 'user1',
      name: 'Test User',
      events: [{ id: 'event1', title: 'Event 1' }],
    };

    it('should return user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserById('user1');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user1' },
        relations: ['events'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findUserById('nonexistent')).rejects.toThrow(
        new NotFoundException('User with ID nonexistent not found')
      );
    });
  });

  describe('removeUser', () => {
    const mockUser = {
      id: 'user1',
      name: 'Test User',
      events: [],
    };

    it('should remove user successfully', async () => {
      jest.spyOn(service, 'findUserById').mockResolvedValue(mockUser as User);
      mockUserRepository.remove.mockResolvedValue(undefined);

      await service.removeUser('user1');

      expect(service.findUserById).toHaveBeenCalledWith('user1');
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(service, 'findUserById').mockRejectedValue(
        new NotFoundException('User with ID nonexistent not found')
      );

      await expect(service.removeUser('nonexistent')).rejects.toThrow(
        new NotFoundException('User with ID nonexistent not found')
      );
    });

    it('should remove user with events', async () => {
      const userWithEvents = {
        ...mockUser,
        events: [{ id: 'event1', title: 'Event 1' }],
      };

      jest.spyOn(service, 'findUserById').mockResolvedValue(userWithEvents as User);
      mockUserRepository.remove.mockResolvedValue(undefined);

      await service.removeUser('user1');

      expect(service.findUserById).toHaveBeenCalledWith('user1');
      expect(mockUserRepository.remove).toHaveBeenCalledWith(userWithEvents);
    });
  });

  describe('mergeAllOverlappingEvents', () => {
    const mockUser = { id: 'user1', name: 'Test User', events: [] };
    const mockEvents = [
      {
        id: 'event1',
        title: 'Event 1',
        description: 'Description 1',
        status: EventStatus.TODO,
        startTime: new Date('2024-01-01T10:00:00.000Z'),
        endTime: new Date('2024-01-01T11:00:00.000Z'),
        invitees: [mockUser],
      },
      {
        id: 'event2',
        title: 'Event 2',
        description: 'Description 2',
        status: EventStatus.IN_PROGRESS,
        startTime: new Date('2024-01-01T10:30:00.000Z'),
        endTime: new Date('2024-01-01T11:30:00.000Z'),
        invitees: [mockUser],
      },
    ];

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.mergeAllOverlappingEvents('nonexistent')).rejects.toThrow(
        new NotFoundException('User with ID nonexistent not found')
      );
    });

    it('should return events when user has one or no events', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockEventRepository.find.mockResolvedValue([mockEvents[0]]);

      const result = await service.mergeAllOverlappingEvents('user1');

      expect(result).toEqual([mockEvents[0]]);
    });

    it('should merge overlapping events', async () => {
      const mergedEvent = {
        id: 'merged',
        title: 'Event 1 + Event 2',
        description: 'Description 1 | Description 2',
        status: EventStatus.IN_PROGRESS,
        startTime: new Date('2024-01-01T10:00:00.000Z'),
        endTime: new Date('2024-01-01T11:30:00.000Z'),
        invitees: [mockUser],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockEventRepository.find.mockResolvedValue(mockEvents);
      mockEventRepository.create.mockReturnValue(mergedEvent);
      mockEventRepository.save.mockResolvedValue(mergedEvent);
      mockEventRepository.remove.mockResolvedValue(undefined);

      const result = await service.mergeAllOverlappingEvents('user1');

      expect(mockEventRepository.remove).toHaveBeenCalledWith(mockEvents);
      expect(result).toEqual([mergedEvent]);
    });

    it('should handle non-overlapping events', async () => {
      const nonOverlappingEvents = [
        {
          ...mockEvents[0],
          endTime: new Date('2024-01-01T10:30:00.000Z'),
        },
        {
          ...mockEvents[1],
          startTime: new Date('2024-01-01T11:00:00.000Z'),
        },
      ];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockEventRepository.find.mockResolvedValue(nonOverlappingEvents);

      const result = await service.mergeAllOverlappingEvents('user1');

      expect(mockEventRepository.remove).not.toHaveBeenCalled();
      expect(result).toEqual(nonOverlappingEvents);
    });
  });

  describe('doEventsOverlap', () => {
    const event1 = {
      startTime: new Date('2024-01-01T10:00:00.000Z'),
      endTime: new Date('2024-01-01T11:00:00.000Z'),
    } as Event;

    const event2 = {
      startTime: new Date('2024-01-01T10:30:00.000Z'),
      endTime: new Date('2024-01-01T11:30:00.000Z'),
    } as Event;

    const event3 = {
      startTime: new Date('2024-01-01T11:00:00.000Z'),
      endTime: new Date('2024-01-01T12:00:00.000Z'),
    } as Event;

    it('should detect overlapping events', () => {
      const result = service['doEventsOverlap'](event1, event2);
      expect(result).toBe(true);
    });

    it('should detect non-overlapping events', () => {
      const result = service['doEventsOverlap'](event1, event3);
      expect(result).toBe(false);
    });
  });
});