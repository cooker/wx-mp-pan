package com.github.cooker.pan.dto;

import java.time.Instant;

/** 按设备或 IP 聚合的一行统计。 */
public record AdminAnalyticsGroupedRowDto(String groupKey, long eventCount, Instant lastSeenAt) {
}
