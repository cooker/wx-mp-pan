package com.github.cooker.pan.dto;

import java.time.Instant;

public record CategoryDto(long id, String name, int sortOrder, Instant createdAt) {
}
