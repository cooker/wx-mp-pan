package com.github.cooker.pan.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/** 网站配置（前台展示、head 注入与埋点开关）。 */
public record SiteConfigDto(
    @NotBlank @Size(max = 200) String siteTitle,
    @Size(max = 100_000) String headerScript,
    boolean trackingEnabled,
    List<String> trackingEvents,
    @Valid List<AppRecommendationDto> appRecommendations
) {
}
