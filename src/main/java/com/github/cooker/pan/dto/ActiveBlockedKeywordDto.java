package com.github.cooker.pan.dto;

import java.time.Instant;

/** 已生效屏蔽词（status=1），用于管理端列表。 */
public record ActiveBlockedKeywordDto(long id, String keyword, Instant createdAt) {
}
