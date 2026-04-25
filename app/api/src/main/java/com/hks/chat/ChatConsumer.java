package com.hks.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hks.chat.dto.ChatResponseMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatConsumer {

    private final ChatService chatService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = ChatTopics.CHAT_RESPONSES, groupId = "${spring.kafka.consumer.group-id}")
    public void handleResponse(ConsumerRecord<String, String> record) {
        try {
            ChatResponseMessage response = objectMapper.readValue(record.value(), ChatResponseMessage.class);
            log.info("AI response received: correlationId={}, model={}", response.correlationId(), response.model());
            chatService.completeRequest(response.correlationId(), response.response());
        } catch (Exception e) {
            log.error("Failed to process AI response from Kafka: {}", e.getMessage());
        }
    }
}
