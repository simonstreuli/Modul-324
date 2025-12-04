#!/bin/bash

# Build script for all KN_03 RabbitMQ applications

set -e  # Exit on error

echo "==================================="
echo "Building KN_03 RabbitMQ Applications"
echo "==================================="

# Task A Applications
echo ""
echo "Building Task A - Sender..."
cd task-a-sender
mvn clean package -DskipTests
cd ..

echo ""
echo "Building Task A - Receiver..."
cd task-a-receiver
mvn clean package -DskipTests
cd ..

# Task B Applications
echo ""
echo "Building Task B - Sender..."
cd task-b-sender
mvn clean package -DskipTests
cd ..

echo ""
echo "Building Task B - Receiver 1..."
cd task-b-receiver1
mvn clean package -DskipTests
cd ..

echo ""
echo "Building Task B - Receiver 2..."
cd task-b-receiver2
mvn clean package -DskipTests
cd ..

# Task C Applications
echo ""
echo "Building Task C - Sender..."
cd task-c-sender
mvn clean package -DskipTests
cd ..

echo ""
echo "Building Task C - Receiver..."
cd task-c-receiver
mvn clean package -DskipTests
cd ..

echo ""
echo "==================================="
echo "All applications built successfully!"
echo "==================================="
echo ""
echo "You can now run the applications with:"
echo "  - All tasks: docker-compose up --build"
echo "  - Task A: docker-compose -f docker-compose-task-a.yml up --build"
echo "  - Task B: docker-compose -f docker-compose-task-b.yml up --build"
echo "  - Task C: docker-compose -f docker-compose-task-c.yml up --build"
