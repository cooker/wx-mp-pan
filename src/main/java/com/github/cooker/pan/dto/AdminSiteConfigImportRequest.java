package com.github.cooker.pan.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AdminSiteConfigImportRequest(
    Integer version,
    @NotNull @Valid SiteConfigDto siteConfig
) {
}
