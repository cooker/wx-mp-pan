package com.github.cooker.pan.dto;

import java.util.List;

/** 首页统计：已上线资源总数、热门搜索词。 */
public record HomeStatsResponse(long totalResources, List<HotKeywordItem> hotKeywords) {
}
