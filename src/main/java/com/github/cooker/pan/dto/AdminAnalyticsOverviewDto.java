package com.github.cooker.pan.dto;

/** 埋点概览统计。 */
public record AdminAnalyticsOverviewDto(
    long totalEvents,
    long homeView,
    long searchSubmit,
    long hotKeywordClick,
    long copyLinkClick,
    long submitResource,
    long submitBlockedKeyword
) {
}
