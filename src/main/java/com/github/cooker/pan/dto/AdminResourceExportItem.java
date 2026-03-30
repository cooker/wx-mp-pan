package com.github.cooker.pan.dto;

/** 单条已上线资源的导出结构（导入时忽略 exportId，按新行插入） */
public record AdminResourceExportItem(
    Long exportId,
    String title,
    String content,
    String type,
    String tags,
    String url,
    Long categoryId,
    String categoryName,
    int heatScore
) {
}
