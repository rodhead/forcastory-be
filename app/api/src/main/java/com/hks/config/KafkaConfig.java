package com.hks.config;

import com.hks.chat.ChatTopics;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic chatRequestsTopic() {
        return TopicBuilder.name(ChatTopics.CHAT_REQUESTS).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic chatResponsesTopic() {
        return TopicBuilder.name(ChatTopics.CHAT_RESPONSES).partitions(1).replicas(1).build();
    }
}
