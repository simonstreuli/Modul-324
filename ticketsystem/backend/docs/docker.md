# Docker Deployment Guide

This guide explains how to run the Ticketsystem using Docker.

## Quick Start with Pre-built Image

The easiest way to run the application is to use the pre-built Docker image from GitHub Container Registry.

### Pull the Latest Image

```bash
docker pull ghcr.io/simonstreuli/modul-324:latest
```

### Run the Container

```bash
docker run -d \
  -p 6001:6001 \
  -e PORT=6001 \
  -e NODE_ENV=production \
  -e MONGO_URI=mongodb://host.docker.internal:27017/ticketsystem \
  -e HOST_URL=localhost:6001 \
  --name ticketsystem \
  ghcr.io/simonstreuli/modul-324:latest
```

### Run with Environment File

For convenience, you can use an `.env` file:

```bash
docker run -d \
  -p 6001:6001 \
  --env-file .env \
  --name ticketsystem \
  ghcr.io/simonstreuli/modul-324:latest
```

## Available Image Tags

The following tags are available in GitHub Container Registry:

- `latest` - The latest stable release from the `main` branch
- `develop` - The latest development version from the `develop` branch
- `v1.0.0`, `v1.0.1`, etc. - Specific version releases
- `pre-prod` - Pre-production release candidates
- `hotfix-x.y.z` - Hotfix versions

### Pull a Specific Version

```bash
docker pull ghcr.io/simonstreuli/modul-324:v1.0.2
```

## Required Environment Variables

For information on required environment variables, please refer to the [README.md](../README.md) and `.env.example` file.

## Building Your Own Docker Image

If you want to build the Docker image locally:

### Build the Image

```bash
docker build -t ticketsystem:latest .
```

The process to run it is the same as above, just replace the image with your custom tag.

## Using Docker Compose

For local development, use Docker Compose:

```bash
docker compose -f docker-compose.backend.yml up -d

# Optionally with MongoDB
docker compose -f docker-compose.backend.yml -f docker-compose.mongodb.yml up -d
```

This will start the application container with the necessary configurations.

## Accessing the Application

Please refer to the [API Documentation](api.md) for details on accessing the API endpoints and Swagger UI.

## Automated Builds

Docker images are automatically built and pushed to GitHub Container Registry by the CI/CD pipeline when code is pushed to:

- `main` branch → Tagged as `latest` and version number
- `develop` branch → Tagged as `develop`
- `release/*` branches → Tagged with release version and `pre-prod`
- `hotfix/*` branches → Tagged with hotfix version
