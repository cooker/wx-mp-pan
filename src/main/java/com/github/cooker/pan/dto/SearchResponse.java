package com.github.cooker.pan.dto;

import java.util.List;

public record SearchResponse(
    long total,
    List<SearchItem> items
) {
}
