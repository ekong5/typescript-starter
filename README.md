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
