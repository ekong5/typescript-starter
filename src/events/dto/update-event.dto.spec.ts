import { validate } from 'class-validator';
import { UpdateEventDto } from './update-event.dto';
import { EventStatus } from '../entities/event.entity';

describe('UpdateEventDto', () => {
  let dto: UpdateEventDto;

  beforeEach(() => {
    dto = new UpdateEventDto();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      dto.title = 'Updated Event';
      dto.description = 'Updated description';
      dto.status = EventStatus.IN_PROGRESS;
      dto.startTime = '2024-01-01T10:00:00.000Z';
      dto.endTime = '2024-01-01T11:00:00.000Z';
      dto.inviteeIds = ['79995e8e-c755-448e-9f79-eed1a79f0c0d'];

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object (all fields optional)', async () => {
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with partial data', async () => {
      dto.title = 'Updated Event';
      dto.status = EventStatus.COMPLETED;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid title type', async () => {
      dto.title = 123 as any;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with invalid description type', async () => {
      dto.description = 123 as any;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with invalid status enum', async () => {
      dto.status = 'INVALID_STATUS' as any;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('status');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail validation with invalid startTime format', async () => {
      dto.startTime = 'invalid-date';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('startTime');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should fail validation with invalid endTime format', async () => {
      dto.endTime = 'invalid-date';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('endTime');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should fail validation with invalid inviteeIds format', async () => {
      dto.inviteeIds = ['invalid-uuid'];

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('inviteeIds');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation with non-array inviteeIds', async () => {
      dto.inviteeIds = 'not-an-array' as any;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('inviteeIds');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });

    it('should pass validation with valid enum values', async () => {
      const validStatuses = [EventStatus.TODO, EventStatus.IN_PROGRESS, EventStatus.COMPLETED];
      
      for (const status of validStatuses) {
        dto.status = status;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should pass validation with valid UUID formats', async () => {
      const validUUIDs = [
        'b17b5be9-2511-4b0a-bb92-392db8e9907b',
        '92983dba-ad31-44e3-b2f3-e68f1d1ae626',
        'c8d8b1bb-2e05-419f-93de-a615fd015100'
      ];
      
      dto.inviteeIds = validUUIDs;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty inviteeIds array', async () => {
      dto.inviteeIds = [];
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with valid ISO date strings', async () => {
      dto.startTime = '2024-01-01T10:00:00.000Z';
      dto.endTime = '2024-01-01T11:00:00.000Z';
      
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('inheritance', () => {
    it('should inherit from CreateEventDto through PartialType', () => {
      expect(dto).toBeInstanceOf(UpdateEventDto);
      expect(dto.constructor.name).toBe('UpdateEventDto');
    });

    it('should have all properties as optional', () => {
      const instance = new UpdateEventDto();
      expect(instance.title).toBeUndefined();
      expect(instance.description).toBeUndefined();
      expect(instance.status).toBeUndefined();
      expect(instance.startTime).toBeUndefined();
      expect(instance.endTime).toBeUndefined();
      expect(instance.inviteeIds).toBeUndefined();
    });
  });
});