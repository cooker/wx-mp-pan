package com.github.cooker.pan.dto;

import java.util.List;

public record AdminResourceImportResult(int imported, int failed, List<String> errors) {
}
