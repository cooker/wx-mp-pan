package com.github.cooker.pan.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateResourceRequest(
    @NotBlank String title,
    /** 可选；未传时存空串，便于仅标题+链接入库 */
    String content,
    String type,
    List<String> tags,
    /** 任意文本，可为空；不做 URL 格式校验 */
    String url
) {
}
