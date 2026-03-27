package com.github.cooker.pan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateSiteConfigRequest(
    @NotBlank @Size(max = 200) String siteTitle,
    /** 注入首页 head 的 HTML/脚本片段；可为空 */
    @Size(max = 100_000) String headerScript,
    Boolean trackingEnabled,
    List<String> trackingEvents
) {
}
