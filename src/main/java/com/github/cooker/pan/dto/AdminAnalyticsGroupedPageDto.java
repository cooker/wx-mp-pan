package com.github.cooker.pan.dto;

import java.util.List;

public record AdminAnalyticsGroupedPageDto(long total, List<AdminAnalyticsGroupedRowDto> items) {
}
