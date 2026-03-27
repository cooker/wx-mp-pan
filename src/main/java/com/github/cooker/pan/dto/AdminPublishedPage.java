package com.github.cooker.pan.dto;

import java.util.List;

public record AdminPublishedPage(long total, List<AdminPublishedResourceDto> items) {
}
