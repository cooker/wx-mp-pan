package com.github.cooker.pan.dto;

import java.time.Instant;

public record PendingBlockedKeywordDto(long id, String keyword, Instant createdAt) {
}
