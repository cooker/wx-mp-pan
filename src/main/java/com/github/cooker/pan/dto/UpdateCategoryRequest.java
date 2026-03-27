package com.github.cooker.pan.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateCategoryRequest(@NotBlank String name, Integer sortOrder) {
}
