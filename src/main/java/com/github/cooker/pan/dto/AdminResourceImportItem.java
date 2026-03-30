package com.github.cooker.pan.dto;

public record AdminResourceImportItem(
    String title,
    String content,
    String type,
    String tags,
    String url,
    Long categoryId,
    String categoryName,
    Integer heatScore
) {
}
