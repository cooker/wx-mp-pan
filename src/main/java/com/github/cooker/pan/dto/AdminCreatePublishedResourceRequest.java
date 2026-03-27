package com.github.cooker.pan.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

/** 管理端新增资源并直接上线（status=1），可选分类。 */
public record AdminCreatePublishedResourceRequest(
    @NotBlank String title,
    String content,
    String type,
    List<String> tags,
    String url,
    Long categoryId
) {
}
