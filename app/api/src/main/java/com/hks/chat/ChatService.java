package com.hks.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private static final int CHAT_TIMEOUT_SECONDS = 120;
    private static final int PING_TIMEOUT_SECONDS = 10;

    private final Map<String, CompletableFuture<String>> pendingRequests = new ConcurrentHashMap<>();
    private final ChatProducer chatProducer;

    public String chat(String tenantId, String message) {
        String correlationId = UUID.randomUUID().toString();
        log.info("Chat request: tenantId={}, correlationId={}", tenantId, correlationId);
        return dispatch(correlationId, CHAT_TIMEOUT_SECONDS, () -> chatProducer.sendChatRequest(correlationId, tenantId, message));
    }

    public String ping() {
        String correlationId = UUID.randomUUID().toString();
        log.info("Ping: correlationId={}", correlationId);
        return dispatch(correlationId, PING_TIMEOUT_SECONDS, () -> chatProducer.sendPing(correlationId));
    }

    public void completeRequest(String correlationId, String response) {
        CompletableFuture<String> future = pendingRequests.remove(correlationId);
        if (future != null) {
            future.complete(response);
            log.debug("Request completed: correlationId={}", correlationId);
        } else {
            log.warn("No pending request for correlationId={}", correlationId);
        }
    }

    private String dispatch(String correlationId, int timeoutSeconds, Runnable sender) {
        CompletableFuture<String> future = new CompletableFuture<>();
        pendingRequests.put(correlationId, future);
        try {
            sender.run();
            return future.get(timeoutSeconds, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            log.error("Request timed out after {}s: correlationId={}", timeoutSeconds, correlationId);
            throw new RuntimeException("AI service did not respond within " + timeoutSeconds + " seconds");
        } catch (Exception e) {
            log.error("Request failed: correlationId={}", correlationId, e);
            throw new RuntimeException("Failed to get AI response: " + e.getMessage());
        } finally {
            pendingRequests.remove(correlationId);
        }
    }
}
