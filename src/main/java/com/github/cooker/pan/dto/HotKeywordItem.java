package com.github.cooker.pan.dto;

/** 热门搜索词（按检索次数统计）。 */
public record HotKeywordItem(String keyword, long count) {
}
