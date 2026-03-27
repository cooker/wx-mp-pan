package com.github.cooker.pan.dto;

import jakarta.validation.constraints.NotBlank;

public record SearchRequest(
    @NotBlank String keyword,
    Integer page,
    Integer size,
    /** relevance | time | hot */
    String sortBy
) {
}
