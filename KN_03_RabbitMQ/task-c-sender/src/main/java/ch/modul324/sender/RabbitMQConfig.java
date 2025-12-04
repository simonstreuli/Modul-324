package ch.modul324.sender;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    
    public static final String QUEUE_NAME = "task-c-work-queue";
    
    @Bean
    public Queue queue() {
        // Durable queue to ensure messages are not lost
        return new Queue(QUEUE_NAME, true);
    }
}
