import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getHomepage', () => {
    it('should return HTML response', () => {
      const appController = app.get(AppController);
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };
      
      appController.getHomepage(mockResponse as any);
      
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(mockResponse.send).toHaveBeenCalledWith(expect.stringContaining('Events API Demo'));
    });
  });
});
