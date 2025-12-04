package ch.modul324.receiver;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class MessageReceiver {
    
    private static final Logger logger = LoggerFactory.getLogger(MessageReceiver.class);
    
    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void receiveMessage(String message) {
        String instanceId = System.getenv().getOrDefault("INSTANCE_ID", "unknown");
        logger.info("Instance {} received: {}", instanceId, message);
        
        // Simulate some processing time to demonstrate load balancing
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
