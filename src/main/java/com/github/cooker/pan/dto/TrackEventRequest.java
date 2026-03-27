package com.github.cooker.pan.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public record TrackEventRequest(
    @NotBlank String event,
    String path,
    String deviceId,
    Map<String, Object> props
) {
}
