package com.github.cooker.pan.dto;

import java.time.Instant;

public record AdminAnalyticsEventItemDto(
    long id,
    String event,
    String path,
    String propsJson,
    String userAgent,
    String deviceId,
    String ipAddress,
    Instant createdAt
) {
}
