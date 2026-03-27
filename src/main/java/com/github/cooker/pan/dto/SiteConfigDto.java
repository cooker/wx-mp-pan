package com.github.cooker.pan.dto;

import java.util.List;

/** 网站配置（前台展示、head 注入与埋点开关）。 */
public record SiteConfigDto(
    String siteTitle,
    String headerScript,
    boolean trackingEnabled,
    List<String> trackingEvents
) {
}
