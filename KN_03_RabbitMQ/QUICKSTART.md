# Quick Start Guide - KN_03 RabbitMQ Messaging

This guide helps you quickly get started with the RabbitMQ messaging project.

## Prerequisites

Ensure you have the following installed:
- Docker and Docker Compose
- Java 17+ and Maven (only needed if building manually)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

All applications are containerized and ready to run with Docker Compose.

#### Step 1: Navigate to the project directory

```bash
cd KN_03_RabbitMQ
```

#### Step 2: Run Task A (Simple Sender-Receiver)

```bash
# Start the services
docker compose -f docker-compose-task-a.yml up --build

# In a new terminal, view the logs
docker compose -f docker-compose-task-a.yml logs -f

# Stop the services (Ctrl+C, then run:)
docker compose -f docker-compose-task-a.yml down
```

**Expected Output:**
- Sender logs: `Sent: Message sent at: 2025-12-04 18:04:01`
- Receiver logs: `Received: Message sent at: 2025-12-04 18:04:01`

#### Step 3: Run Task B (Fanout - Multiple Receivers)

```bash
# Start the services
docker compose -f docker-compose-task-b.yml up --build

# View logs
docker compose -f docker-compose-task-b.yml logs -f

# Stop the services
docker compose -f docker-compose-task-b.yml down
```

**Expected Output:**
- Sender logs: `Sent: Broadcast message sent at: 2025-12-04 18:05:41`
- Receiver 1 logs: `Receiver 1 received: Broadcast message sent at: 2025-12-04 18:05:41`
- Receiver 2 logs: `Receiver 2 received: Broadcast message sent at: 2025-12-04 18:05:41`
- **Both receivers get the same message**

#### Step 4: Run Task C (Load Balancing - Work Queue)

```bash
# Start the services
docker compose -f docker-compose-task-c.yml up --build

# View logs
docker compose -f docker-compose-task-c.yml logs -f

# Stop the services
docker compose -f docker-compose-task-c.yml down
```

**Expected Output:**
- Sender logs: `Sent: Work queue message sent at: 2025-12-04 18:07:23`
- Receiver instances logs show different instances processing different messages:
  - `Instance 1 received: Work queue message sent at: 2025-12-04 18:07:28`
  - `Instance 2 received: Work queue message sent at: 2025-12-04 18:07:23`
  - `Instance 3 received: Work queue message sent at: 2025-12-04 18:07:33`
- **Each message goes to only one instance**

### Option 2: Building JAR files first

If you want to build the JAR files before running Docker Compose:

```bash
# Build all applications
./build-all.sh

# Then run with Docker Compose as above
docker compose -f docker-compose-task-a.yml up
```

## Accessing RabbitMQ Management UI

Open your browser and navigate to:
```
http://localhost:15672
```

**Login credentials:**
- Username: `guest`
- Password: `guest`

In the management UI, you can:
- View queues and exchanges
- Monitor message rates
- See connections and channels
- Inspect message statistics

## Testing Scenarios

### Test Task A: Message Persistence

1. Start Task A: `docker compose -f docker-compose-task-a.yml up`
2. Watch messages being sent and received
3. Stop the receiver: `docker stop task-a-receiver`
4. Wait for several messages to be sent (check sender logs)
5. Start the receiver: `docker start task-a-receiver`
6. **Result:** All queued messages are delivered to the receiver

### Test Task B: Broadcasting

1. Start Task B: `docker compose -f docker-compose-task-b.yml up`
2. Watch both receivers getting all messages
3. Stop one receiver: `docker stop task-b-receiver1`
4. **Result:** Receiver 2 continues receiving all messages
5. Start receiver 1: `docker start task-b-receiver1`
6. **Result:** Receiver 1 starts receiving new messages

### Test Task C: Load Balancing

1. Start Task C: `docker compose -f docker-compose-task-c.yml up`
2. Watch messages distributed among 3 instances
3. **Result:** Each message goes to only one instance
4. Stop one instance: `docker stop task-c-receiver-2`
5. **Result:** Remaining instances continue processing messages
6. Messages are redistributed among active instances

## Common Commands

### View Logs

```bash
# All services
docker compose -f docker-compose-task-a.yml logs -f

# Specific service
docker compose -f docker-compose-task-a.yml logs -f sender
```

### Stop and Remove All Containers

```bash
docker compose -f docker-compose-task-a.yml down
docker compose -f docker-compose-task-b.yml down
docker compose -f docker-compose-task-c.yml down
```

### Restart Services

```bash
# Restart a specific service
docker compose -f docker-compose-task-a.yml restart receiver

# Restart all services
docker compose -f docker-compose-task-a.yml restart
```

## Understanding the Output

### Task A Output Example
```
task-a-sender    | Sent: Message sent at: 2025-12-04 18:04:01
task-a-receiver  | Received: Message sent at: 2025-12-04 18:04:01
task-a-sender    | Sent: Message sent at: 2025-12-04 18:04:06
task-a-receiver  | Received: Message sent at: 2025-12-04 18:04:06
```

### Task B Output Example
```
task-b-sender     | Sent: Broadcast message sent at: 2025-12-04 18:05:41
task-b-receiver1  | Receiver 1 received: Broadcast message sent at: 2025-12-04 18:05:41
task-b-receiver2  | Receiver 2 received: Broadcast message sent at: 2025-12-04 18:05:41
```

### Task C Output Example
```
task-c-sender      | Sent: Work queue message sent at: 2025-12-04 18:07:23
task-c-receiver-2  | Instance 2 received: Work queue message sent at: 2025-12-04 18:07:23
task-c-sender      | Sent: Work queue message sent at: 2025-12-04 18:07:28
task-c-receiver-1  | Instance 1 received: Work queue message sent at: 2025-12-04 18:07:28
task-c-sender      | Sent: Work queue message sent at: 2025-12-04 18:07:33
task-c-receiver-3  | Instance 3 received: Work queue message sent at: 2025-12-04 18:07:33
```

## Troubleshooting

### Services can't connect to RabbitMQ

**Solution:** Wait a few seconds after RabbitMQ starts, then restart the application containers:
```bash
docker compose -f docker-compose-task-a.yml restart sender receiver
```

### Port already in use

**Solution:** Stop any services using ports 5672 or 15672:
```bash
docker ps  # Find containers using these ports
docker stop <container-id>
```

### Need to clean up everything

```bash
# Stop all containers
docker compose -f docker-compose-task-a.yml down
docker compose -f docker-compose-task-b.yml down
docker compose -f docker-compose-task-c.yml down

# Remove all stopped containers and networks
docker system prune
```

## Next Steps

- Read the [full README](README.md) for detailed information
- Explore the RabbitMQ Management UI
- Modify the code to understand how it works
- Try scaling up receivers in Task C: `docker compose -f docker-compose-task-c.yml up --scale receiver-1=5`
