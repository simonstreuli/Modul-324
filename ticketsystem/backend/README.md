# Ticketsystem

A modern ticket and employee management system built with Node.js and Express.js. Ticketsystem helps teams manage support tickets efficiently by tracking employee assignments, skill levels, and ticket status workflows.

## Key Features

- **Employee Management** - Create and manage employee records with skill level tracking (1-5 scale)
- **Ticket System** - Full ticket lifecycle management with status tracking (Open → In Progress → Review → Done)
- **Smart Validation** - Automatic validation of employee assignments and status-based date requirements
- **RESTful API** - Clean, well-documented API endpoints with Swagger UI
- **Docker Ready** - Pre-built Docker images available on GitHub Container Registry
- **Full Test Coverage** - Comprehensive test suite with Jest and Supertest

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v20 or higher
- **MongoDB** (local installation or Docker)
- **npm** (comes with Node.js)

## Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings. All variables are required:

```env
PORT=6001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ticketsystem
HOST_URL=localhost:6001
```

3. **Start MongoDB:**

Using Docker Compose (recommended):

```bash
docker compose -f docker-compose.mongodb.yml up -d
```

## Basic Usage

### Start the Development Server

```bash
npm run dev
```

The server starts at `http://localhost:6001`.

### Access the API Documentation

Open your browser and navigate to:

```
http://localhost:6001/api-docs
```

The interactive Swagger UI lets you explore and test all API endpoints.

### Quick API Example

Create an employee:

```bash
curl -X POST http://localhost:6001/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "vorname": "Max",
    "nachname": "Mustermann",
    "beitrittsdatum": "2021-05-15",
    "skillLevel": 4
  }'
```

### Running Tests

The project includes both unit tests and integration tests:

```bash
# Run all tests (unit + integration)
npm test

# Run only unit tests (fast, no database required)
npm run test:unit

# Run only integration tests (requires MongoDB)
npm run test:integration

# Run tests with coverage report
npm run test:coverage
```

**For integration tests**, ensure MongoDB is running:

```bash
docker compose -f docker-compose.mongodb.yml up -d
```

See **[Integration Tests Guide](docs/integration-tests.md)** for detailed information about integration testing.

Check code quality:

```bash
npm run lint
```

## Documentation

For more detailed information, see the documentation in the `/docs` folder:

- **[API Reference](docs/api.md)** - Complete API endpoint documentation with request/response examples
- **[Docker Guide](docs/docker.md)** - How to run with Docker, pull images from GHCR, and deploy
- **[Development Guide](docs/development.md)** - Development setup, testing, CI/CD, and contribution guidelines

## Docker Deployment

### Using Pre-built Image (Recommended)

Pull and run the latest image from GitHub Container Registry:

```bash
docker pull ghcr.io/simonstreuli/modul-324:latest
docker run -d -p 6001:6001 --env-file .env ghcr.io/simonstreuli/modul-324:latest
```

See the **[Docker Guide](docs/docker.md)** for detailed deployment instructions.
