package com.hks.chat.dto;

public record ChatResponseMessage(
        String correlationId,
        String response,
        String model,
        String timestamp
) {}
