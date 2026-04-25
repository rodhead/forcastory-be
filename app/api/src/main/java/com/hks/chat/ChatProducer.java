package com.hks.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hks.chat.dto.ChatRequestMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendChatRequest(String correlationId, String tenantId, String message) {
        send(new ChatRequestMessage(correlationId, tenantId, message, "CHAT", LocalDateTime.now().toString()));
    }

    public void sendPing(String correlationId) {
        send(new ChatRequestMessage(correlationId, null, "ping", "PING", LocalDateTime.now().toString()));
    }

    private void send(ChatRequestMessage msg) {
        try {
            String json = objectMapper.writeValueAsString(msg);
            kafkaTemplate.send(ChatTopics.CHAT_REQUESTS, msg.correlationId(), json);
            log.info("Published {} to {}: correlationId={}", msg.messageType(), ChatTopics.CHAT_REQUESTS, msg.correlationId());
        } catch (Exception e) {
            log.error("Failed to publish Kafka message", e);
            throw new RuntimeException("Failed to send message to AI service", e);
        }
    }
}
