package com.github.cooker.pan.dto;

import java.time.Instant;

/** 网站配置全量导出（与导入 JSON 结构一致）。 */
public record AdminSiteConfigExportBundle(int version, Instant exportedAt, SiteConfigDto siteConfig) {
}
