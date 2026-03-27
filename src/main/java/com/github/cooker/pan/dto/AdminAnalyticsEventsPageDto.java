package com.github.cooker.pan.dto;

import java.util.List;

public record AdminAnalyticsEventsPageDto(
    long total,
    List<AdminAnalyticsEventItemDto> items
) {
}
