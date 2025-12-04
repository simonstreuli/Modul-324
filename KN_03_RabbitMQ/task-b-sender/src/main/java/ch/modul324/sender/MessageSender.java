package ch.modul324.sender;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
@EnableScheduling
public class MessageSender {
    
    private static final Logger logger = LoggerFactory.getLogger(MessageSender.class);
    private final RabbitTemplate rabbitTemplate;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public MessageSender(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }
    
    @Scheduled(fixedRate = 5000) // Every 5 seconds
    public void sendMessage() {
        String timestamp = LocalDateTime.now().format(formatter);
        String message = "Broadcast message sent at: " + timestamp;
        
        // Send to fanout exchange - all bound queues will receive this message
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "", message);
        logger.info("Sent: {}", message);
    }
}
