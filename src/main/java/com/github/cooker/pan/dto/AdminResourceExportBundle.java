package com.github.cooker.pan.dto;

import java.time.Instant;
import java.util.List;

public record AdminResourceExportBundle(
    int version,
    Instant exportedAt,
    List<AdminResourceExportItem> items
) {
}
