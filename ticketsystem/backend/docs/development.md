# Development Guide

This guide provides detailed information for developers working on the Ticketsystem.

## Technology Stack

- **Backend Framework**: Express.js 5.x
- **Database**: MongoDB
- **ODM**: Mongoose
- **Testing**: Jest with Supertest
- **API Documentation**: Swagger
- **Code Quality**: ESLint, Prettier
- **Logging**: Morgan
- **Security**: Helmet
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Project Structure

```
├── config/           # Configuration management
│   └── index.js      # Environment variables validation
├── models/           # Mongoose models
│   ├── Employee.js   # Employee schema
│   └── Ticket.js     # Ticket schema
├── routes/           # Express routes
│   ├── employee.js   # Employee endpoints
│   └── ticket.js     # Ticket endpoints
├── tests/            # Test files
│   ├── test.employee.js
│   └── test.ticket.js
├── docs/             # Documentation
│   ├── api.md        # API reference
│   ├── docker.md     # Docker guide
│   └── development.md # This file
├── index.js          # Express app configuration
├── server.js         # Server entry point
├── swagger.js        # Swagger configuration
└── package.json      # Dependencies and scripts
```

## Development Setup

### Prerequisites

Ensure you have the following installed:

- Node.js v20 or higher
- MongoDB (using Docker)
- npm
- Git

### Setting Up the Project

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

3. Edit the `.env` file with your configuration. **All environment variables are required**:

```env
PORT=6001
HOST_URL=localhost:6001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ticketsystem
```

4. Set up MongoDB using Docker:

```bash
docker compose -f docker-compose.mongodb.yml up -d
```

## Running the Application

### Development Mode

Development mode includes hot reloading with nodemon:

```bash
npm run dev
```

The server starts on `http://localhost:6001`.

### Production Mode

```bash
npm start
```

### Access Points

- **API Base URL**: `http://localhost:6001`
- **Swagger UI**: `http://localhost:6001/api-docs`

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory. If pushed to the `develop` branch, they are also generated in GitHub Pages.

### Test Structure

All tests follow the AAA (Arrange, Act, Assert) pattern:

```javascript
test('should create employee', async () => {
  // Arrange
  const employeeData = {
    /* ... */
  };

  // Act
  const response = await request(app).post('/api/employees').send(employeeData);

  // Assert
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('_id');
});
```

### Testing Guidelines

- Each test is independent and isolated
- External dependencies (DB, APIs) are mocked
- One test focuses on one specific functionality
- Tests use descriptive names
- Clean up test data after each test

## Code Quality

### Linting

Check code quality:

```bash
npm run lint
```

Auto-fix issues:

```bash
npm run lint:fix
```

### Code Formatting

Format code with Prettier:

```bash
npm run format
```

## CI/CD Pipeline

The project uses GitHub Actions for automated testing and deployment.

### Workflows

> [!CAUTION]
> Please ensure that the version in the `package.json` file is updated when making releases or merging changes into the main branch. Failure to do so will result in the release tagging job failing.

1. **Lint and Test** (runs on all PRs and pushes)
   - ESLint code quality checks
   - Jest test suite execution
   - Coverage report generation

2. **Docker Build and Push** (runs on branch pushes)
   - Builds Docker image
   - Pushes to GitHub Container Registry
   - Tags based on branch name

3. **Release Tagging** (runs on main branch)
   - Creates Git tags for releases
   - Uses semantic versioning

## Configuration Management

All configuration is managed through environment variables in the `.env` file.

### No Fallback Values

The application does **not** use fallback values. Missing environment variables cause startup failure with clear error messages.

### Required Variables

- `PORT` - Server port
- `NODE_ENV` - Environment (development/production/test)
- `MONGO_URI` - MongoDB connection string
- `HOST_URL` - Host URL for Swagger UI

### Validation

Configuration validation happens at startup in `config/index.js`. The application exits if any required variable is missing.

## API Documentation

### Swagger Generation

Generate Swagger documentation:

```bash
npm run build:swagger
```

This creates `swagger.json` in the root directory.

## Database

### MongoDB Connection

The application connects to MongoDB on startup.

### Models

Models are defined using Mongoose schemas:

- `Employee` - Employee records
- `Ticket` - Ticket records

### Validation

- Schema-level validation via Mongoose
- Custom business logic validation in routes
- Input sanitization to prevent injection

## Error Handling

### Error Response Format

All errors return JSON:

```json
{
  "error": "Error message"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

### Custom Error Messages

Error messages are in German for user-facing responses:

- "Mitarbeiter nicht gefunden" - Employee not found
- "Ungültiges SkillLevel" - Invalid skill level

## Security

### Security Headers

Helmet.js adds security headers:

- XSS Protection
- Content Security Policy
- Frame protection
- HTTPS enforcement

### Input Validation

- Validate all user inputs
- Sanitize data before database operations
- Use Mongoose schema validation
- Prevent MongoDB injection

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Jest Documentation](https://jestjs.io/)
- [Docker Documentation](https://docs.docker.com/)
