package com.hks.chat.dto;

public record ChatRequestMessage(
        String correlationId,
        String tenantId,
        String message,
        String messageType,
        String timestamp
) {}
