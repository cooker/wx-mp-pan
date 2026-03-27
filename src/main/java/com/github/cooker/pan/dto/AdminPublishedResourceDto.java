package com.github.cooker.pan.dto;

import java.time.Instant;

public record AdminPublishedResourceDto(
    long id,
    String title,
    String url,
    String type,
    String tags,
    Long categoryId,
    String categoryName,
    int heatScore,
    Instant createdAt,
    Instant updatedAt,
    /** 正文全文（管理端列表展示） */
    String content
) {
}
