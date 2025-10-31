# Integration Tests Guide

## Overview

Integration tests have been added to the backend to verify the complete system behavior with real database connections. Unlike unit tests that mock dependencies, integration tests ensure that all components work together correctly.

## What are Integration Tests?

**Integration Tests** test the interaction between different components of the system:
- Real database operations (MongoDB)
- Cross-service communication (Employee API ↔ Ticket API)
- Full request-response cycles
- Data consistency across multiple operations

**Unit Tests** (existing) focus on individual components in isolation:
- Mock database models
- Mock external dependencies (like axios)
- Test individual functions and endpoints

## Test Structure

The integration tests are located in:
```
tests/integration.test.js
```

### Test Coverage

The integration tests cover:

1. **Employee Operations**
   - Creating employees and verifying persistence
   - Retrieving all employees from database
   - Fetching specific employees by ID

2. **Ticket Operations**
   - Creating tickets with valid employee references
   - Rejecting tickets with non-existent employees
   - Retrieving all tickets from database

3. **Cross-Service Integration**
   - Complete workflow: Create employee → Create ticket → Verify both
   - Employee validation across services
   - Status transitions with date validations

4. **Data Integrity**
   - Consistency across multiple operations
   - Concurrent request handling

## Running Tests

### Prerequisites

Before running integration tests, you need:

1. **MongoDB running** - Start MongoDB using Docker Compose:
   ```bash
   docker compose -f docker-compose.mongodb.yml up -d
   ```

2. **Environment variables configured** - Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

### Test Commands

Run different types of tests:

```bash
# Run all tests (unit + integration)
npm test

# Run only unit tests (mocked, no database needed)
npm run test:unit

# Run only integration tests (requires MongoDB)
npm run test:integration

# Run tests with coverage report
npm run test:coverage
```

## Configuration Requirements

### Environment Variables

Integration tests require these environment variables (set in `.env`):

```env
PORT=6001
HOST_URL=localhost:6001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ticketsystem
```

### MongoDB Setup

**Option 1: Docker (Recommended)**
```bash
# Start MongoDB
docker compose -f docker-compose.mongodb.yml up -d

# Stop MongoDB
docker compose -f docker-compose.mongodb.yml down
```

**Option 2: Local MongoDB Installation**
- Install MongoDB locally
- Ensure it's running on `mongodb://localhost:27017`
- Update `MONGO_URI` in `.env` if using a different port

### Test Database

Integration tests automatically:
- Create a separate test database (`ticketsystem-integration-test`)
- Clean up data before each test
- Drop the database after all tests complete

This ensures:
- No interference with development data
- Clean state for each test run
- No manual cleanup required

## Integration Test Quality

The integration tests are designed to be:

### ✅ Simple
- Clear test names describing what is being tested
- Arrange-Act-Assert pattern for readability
- Focused on one specific behavior per test

### ✅ Qualitative
- Test real-world scenarios (complete workflows)
- Verify both API responses and database state
- Cover critical integration points between services
- Test error cases (invalid data, missing references)

### ✅ Reliable
- Use real database (not mocks)
- Clean database state before each test
- Start/stop server as needed
- Independent tests that can run in any order

## Key Differences from Unit Tests

| Aspect | Unit Tests | Integration Tests |
|--------|-----------|-------------------|
| Database | Mocked in-memory | Real MongoDB |
| External calls | Mocked (axios) | Real HTTP calls |
| Server | Not started | Started for tests |
| Speed | Fast (~2s) | Slightly slower (~1-2s) |
| Purpose | Component isolation | Component interaction |

## Troubleshooting

### MongoDB Connection Issues

**Problem:** Tests fail with "ECONNREFUSED" or connection errors

**Solution:**
```bash
# Check if MongoDB is running
docker ps | grep mongodb-dev

# If not running, start it
docker compose -f docker-compose.mongodb.yml up -d

# Wait a few seconds for MongoDB to initialize
sleep 3

# Run tests again
npm run test:integration
```

### Port Already in Use

**Problem:** Server fails to start on port 6001

**Solution:**
```bash
# Find process using port 6001
lsof -ti:6001

# Kill the process
kill -9 $(lsof -ti:6001)

# Or change the port in .env
PORT=6002
```

### Swagger File Missing

**Problem:** Tests fail with "Cannot find module './swagger.json'"

**Solution:**
```bash
# Generate swagger documentation
npm run build:swagger
```

## Best Practices

1. **Always run integration tests before deployment** to ensure all components work together

2. **Run unit tests during development** for quick feedback (they're faster)

3. **Use integration tests for API contract testing** to ensure endpoints work as expected

4. **Keep integration tests focused** on critical paths and cross-service interactions

5. **Don't duplicate unit test coverage** in integration tests - focus on integration scenarios

## CI/CD Integration

For continuous integration pipelines:

```yaml
# Example CI configuration
steps:
  - name: Start MongoDB
    run: docker compose -f docker-compose.mongodb.yml up -d
  
  - name: Wait for MongoDB
    run: sleep 5
  
  - name: Run all tests
    run: npm test
  
  - name: Stop MongoDB
    run: docker compose -f docker-compose.mongodb.yml down
```

## Summary

Integration tests provide confidence that:
- ✅ Database operations work correctly
- ✅ Employee and Ticket services communicate properly
- ✅ Data validation works across services
- ✅ The system handles real-world scenarios

To get started:
1. Start MongoDB: `docker compose -f docker-compose.mongodb.yml up -d`
2. Create .env: `cp .env.example .env`
3. Run tests: `npm run test:integration`
