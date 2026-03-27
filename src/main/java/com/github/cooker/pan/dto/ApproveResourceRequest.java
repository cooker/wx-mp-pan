package com.github.cooker.pan.dto;

/** 审核通过时可指定分类；categoryId 为 null 表示不修改分类 */
public record ApproveResourceRequest(Long categoryId) {
}
