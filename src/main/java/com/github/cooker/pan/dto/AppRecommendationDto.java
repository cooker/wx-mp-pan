package com.github.cooker.pan.dto;

import jakarta.validation.constraints.Size;

/** 首页展示的单个 APP 推荐（图标 URL + 下载链接）。 */
public record AppRecommendationDto(
    /** 展示名称，可选 */
    @Size(max = 80) String name,
    /** 图标地址，建议 https；可为空则前台显示占位 */
    @Size(max = 2000) String iconUrl,
    @Size(max = 2000) String downloadUrl
) {
}
