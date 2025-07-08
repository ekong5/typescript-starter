// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './events/entities/user.entity';
import { Event } from './events/entities/event.entity';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // ConfigModule for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // TypeOrmModule for database configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'events_db',
      entities: [User, Event],
      synchronize: true, // This creates tables automatically (development only!)
      logging: true, // See SQL queries in console
    }),
    
    DatabaseModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}