package com.github.cooker.pan.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AdminResourceImportRequest(
    @NotNull @NotEmpty List<AdminResourceImportItem> items
) {
}
