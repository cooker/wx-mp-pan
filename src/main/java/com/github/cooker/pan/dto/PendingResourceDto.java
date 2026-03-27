package com.github.cooker.pan.dto;

import java.time.Instant;

public record PendingResourceDto(
    long id,
    String title,
    String url,
    /** 正文全文 */
    String content,
    String type,
    String tags,
    Long categoryId,
    Instant createdAt
) {
}
