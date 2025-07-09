## Requirements

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL database

## Installation

```bash
npm install
```

## Configuration

Configure your database connection in `src/config/database.config.ts` or use environment variables.

## Available Scripts

### Development
```bash
npm run start:dev    # Start in development mode with hot reload
```

### Building
```bash
npm run build        # Build the application
npm run start:prod   # Start built application
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage
npm run test:e2e     # Run end-to-end tests
```

## API Endpoints

### Events
- `POST /events` - Create a new event
- `GET /events/:id` - Get event by ID
- `DELETE /events/:id` - Delete event by ID
- `POST /events/merge-all/:userId` - Merge overlapping events for a user
- `POST /events/users` - Create a new user
- `GET /events/users/all` - Get all users

### Example Command-line requests

#### Create user
```bash
curl -X POST http://localhost:{port number}/events/users \
  -H "Content-Type: application/json" \
  -d '{"name": "{user name}"}'
```

#### Create a new event
```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "{title}",
    "description": "{description}",
    "status": "{status}",
    "startTime": "{start}",
    "endTime": "{end}",
    "inviteeIds": [{"user id 1", ..., "user id n"}]
  }'
```
valid date format for startTime and endTime fields: ISO 8601. example: 2024-01-15T10:00:00Z
possible stata: "TODO", "IN_PROGRESS", "COMPLETED"

#### Get an event by ID
```bash
curl -X GET http://localhost:3000/events/{event-uuid}
```

#### Delete an event
```bash
curl -X DELETE http://localhost:3000/events/{event-uuid}
```

#### Merge overlapping events for a user
```bash
curl -X POST http://localhost:3000/events/merge-all/{user-uuid}
```

#### Get all users
```bash
curl -X GET http://localhost:3000/events/users/all
```

## Project Structure

```
src/
├── config/          # Configuration files
├── database/        # Database module
├── events/          # Events module
│   ├── dto/         # Data Transfer Objects
│   ├── entities/    # Database entities
│   └── *.ts         # Controllers, services, and tests
└── main.ts          # Application entry point
```

## License

MIT
