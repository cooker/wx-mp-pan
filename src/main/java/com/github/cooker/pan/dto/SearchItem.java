package com.github.cooker.pan.dto;

public record SearchItem(
    Long id,
    String title,
    String type,
    String tags,
    String url,
    String highlight,
    String categoryName,
    int heatScore
) {
}
