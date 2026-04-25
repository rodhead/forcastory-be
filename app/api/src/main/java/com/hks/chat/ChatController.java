package com.hks.chat;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/v1/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "AI chat powered by Ollama via Kafka")
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "Send a message to the AI assistant")
    @PostMapping
    public ChatApiResponse chat(
            @RequestHeader("X-tenantId") String tenantId,
            @Valid @RequestBody ChatApiRequest request) {
        log.info("Chat: tenantId={}", tenantId);
        return new ChatApiResponse(chatService.chat(tenantId, request.message()));
    }

    @Operation(summary = "Test connectivity with the Python AI service via Kafka")
    @GetMapping("/ping")
    public ResponseEntity<PingResponse> ping() {
        log.info("Ping request");
        String reply = chatService.ping();
        return ResponseEntity.ok(new PingResponse("ok", reply));
    }

    public record ChatApiRequest(@NotBlank String message) {}

    public record ChatApiResponse(String response) {}

    public record PingResponse(String status, String message) {}
}
