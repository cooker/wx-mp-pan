package com.github.cooker.pan.dto;

import jakarta.validation.constraints.NotBlank;

/** 管理端编辑待审核或已上线资源的字段；与创建接口字段含义一致。 */
public record AdminResourceUpdateRequest(
    @NotBlank String title,
    String content,
    String type,
    /** 逗号分隔的标签串，与库内存储一致 */
    String tags,
    String url,
    /** null 表示不指定分类 */
    Long categoryId
) {}
