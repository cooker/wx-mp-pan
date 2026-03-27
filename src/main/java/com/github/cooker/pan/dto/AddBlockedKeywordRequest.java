package com.github.cooker.pan.dto;

import jakarta.validation.constraints.NotBlank;

public record AddBlockedKeywordRequest(@NotBlank String keyword) {
}
