# KN_03: RabbitMQ Messaging with Spring Boot

This project implements three RabbitMQ messaging scenarios using Spring Boot and Docker Compose.

## Project Structure

```
KN_03_RabbitMQ/
├── task-a-sender/          # Task A: Simple sender
├── task-a-receiver/        # Task A: Simple receiver
├── task-b-sender/          # Task B: Fanout sender
├── task-b-receiver1/       # Task B: First receiver
├── task-b-receiver2/       # Task B: Second receiver
├── task-c-sender/          # Task C: Work queue sender
├── task-c-receiver/        # Task C: Scalable receiver
├── docker-compose.yml      # Complete setup for all tasks
├── docker-compose-task-a.yml
├── docker-compose-task-b.yml
├── docker-compose-task-c.yml
└── README.md
```

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Docker and Docker Compose

## Tasks Overview

### Task A: Simple Sender-Receiver

**Objective**: Asynchronous message flow from one application to another.

- **A1 Sender**: Sends a message every 5 seconds (timestamp)
- **A2 Receiver**: Receives and logs messages
- **Features**:
  - Durable queue ensures messages are not lost
  - Messages persist even when receiver is temporarily down

**Pattern**: Direct Queue

### Task B: Fanout Exchange (One Message, Multiple Receivers)

**Objective**: Broadcast messages to multiple independent receivers.

- **B1 Sender**: Sends a message every 5 seconds
- **B2 Receiver 1**: Receives and logs all messages
- **B3 Receiver 2**: Receives and logs all messages
- **Features**:
  - Both receivers get every message independently
  - Uses Fanout Exchange for broadcasting

**Pattern**: Publish/Subscribe (Fanout)

### Task C: Work Queue (Load Balancing)

**Objective**: Horizontal scaling with fair load distribution.

- **C1 Sender**: Sends messages every 5 seconds
- **C1 Receivers**: Multiple instances share the workload
- **Features**:
  - Messages are distributed fairly among instances
  - Only one instance processes each message
  - Fair dispatch with prefetch count = 1
  - Resilient to instance failures

**Pattern**: Work Queue (Competing Consumers)

## Building the Applications

You can build all applications at once or individually.

### Build All Applications

```bash
cd KN_03_RabbitMQ

# Build Task A
cd task-a-sender && mvn clean package && cd ..
cd task-a-receiver && mvn clean package && cd ..

# Build Task B
cd task-b-sender && mvn clean package && cd ..
cd task-b-receiver1 && mvn clean package && cd ..
cd task-b-receiver2 && mvn clean package && cd ..

# Build Task C
cd task-c-sender && mvn clean package && cd ..
cd task-c-receiver && mvn clean package && cd ..
```

### Or Use the Build Script

```bash
cd KN_03_RabbitMQ
chmod +x build-all.sh
./build-all.sh
```

## Running the Applications

### Run All Tasks Together

```bash
cd KN_03_RabbitMQ
docker compose up --build
```

### Run Individual Tasks

#### Task A Only
```bash
docker compose -f docker-compose-task-a.yml up --build
```

#### Task B Only
```bash
docker compose -f docker-compose-task-b.yml up --build
```

#### Task C Only
```bash
docker compose -f docker-compose-task-c.yml up --build
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Or for individual tasks
docker compose -f docker-compose-task-a.yml down
docker compose -f docker-compose-task-b.yml down
docker compose -f docker-compose-task-c.yml down
```

## Monitoring

### RabbitMQ Management UI

Access the RabbitMQ Management UI at: http://localhost:15672

- **Username**: guest
- **Password**: guest

Here you can:
- View queues and their message counts
- Monitor message rates
- See connections and channels
- Inspect exchanges and bindings

### Viewing Logs

```bash
# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f task-a-sender
docker compose logs -f task-a-receiver

# For individual task compose files
docker compose -f docker-compose-task-a.yml logs -f
```

## Testing Scenarios

### Task A: Message Persistence

1. Start the services: `docker compose -f docker-compose-task-a.yml up`
2. Observe messages being sent and received
3. Stop the receiver: `docker stop task-a-receiver`
4. Wait for a few messages to be sent (check sender logs)
5. Restart the receiver: `docker start task-a-receiver`
6. Verify all queued messages are received

### Task B: Broadcasting

1. Start the services: `docker compose -f docker-compose-task-b.yml up`
2. Observe both receivers getting the same messages
3. Stop one receiver
4. Verify the other receiver still gets all messages
5. Restart the stopped receiver
6. Verify it starts receiving new messages

### Task C: Load Balancing

1. Start the services: `docker compose -f docker-compose-task-c.yml up`
2. Observe messages being distributed among 3 receiver instances
3. Each message goes to only one instance (check INSTANCE_ID in logs)
4. Stop one instance: `docker stop task-c-receiver-2`
5. Verify remaining instances continue processing messages
6. Scale up: `docker compose -f docker-compose-task-c.yml up --scale receiver-1=5`

## Architecture Details

### Task A: Direct Queue
```
Sender --> Queue (task-a-queue) --> Receiver
```

### Task B: Fanout Exchange
```
                    +--> Queue (receiver1) --> Receiver 1
Sender --> Exchange |
                    +--> Queue (receiver2) --> Receiver 2
```

### Task C: Work Queue
```
                    +--> Receiver Instance 1
Sender --> Queue -->|--> Receiver Instance 2
                    +--> Receiver Instance 3
```

## Configuration

All applications are configured to connect to RabbitMQ with:
- Host: `rabbitmq`
- Port: `5672`
- Username: `guest`
- Password: `guest`

These settings can be modified in each application's `application.properties` file.

## Key Implementation Details

### Durable Queues
All queues are configured as durable (`durable=true`) to ensure messages survive RabbitMQ restarts.

### Fair Dispatch (Task C)
The Task C receiver uses `prefetchCount=1` to ensure fair distribution of messages among multiple instances.

### Message Logging
All applications log:
- Sender: Every sent message with timestamp
- Receiver: Every received message
- Task C receivers also log their instance ID

## Troubleshooting

### Applications Can't Connect to RabbitMQ
- Ensure RabbitMQ container is healthy: `docker compose ps`
- Check RabbitMQ logs: `docker compose logs rabbitmq`
- Verify network connectivity: `docker network ls`

### Messages Not Being Received
- Check RabbitMQ Management UI for queue status
- Verify receiver is running: `docker compose ps`
- Check receiver logs for errors

### Build Failures
- Ensure Java 17 is installed: `java -version`
- Ensure Maven is installed: `mvn -version`
- Clean Maven cache: `mvn clean`

## Technology Stack

- **Spring Boot**: 3.2.0
- **Spring AMQP**: For RabbitMQ integration
- **RabbitMQ**: 3.12 with Management UI
- **Java**: 17
- **Maven**: 3.6+
- **Docker**: For containerization
- **Docker Compose**: For orchestration

## Learning Outcomes

After completing this project, you will understand:
1. Asynchronous messaging patterns
2. Message persistence and durability
3. Publish/Subscribe pattern with Fanout Exchange
4. Work Queue pattern for load balancing
5. Horizontal scaling of message consumers
6. Fair message distribution
7. RabbitMQ configuration and monitoring
8. Spring Boot AMQP integration
9. Docker Compose orchestration

## References

- [Spring AMQP Documentation](https://docs.spring.io/spring-amqp/reference/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
