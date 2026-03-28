package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.AdminCreatePublishedResourceRequest;
import com.github.cooker.pan.dto.AdminPublishedPage;
import com.github.cooker.pan.dto.AdminResourceExportBundle;
import com.github.cooker.pan.dto.AdminResourceExportItem;
import com.github.cooker.pan.dto.AdminResourceImportItem;
import com.github.cooker.pan.dto.AdminResourceImportResult;
import com.github.cooker.pan.dto.ApproveResourceRequest;
import com.github.cooker.pan.dto.PendingResourceDto;
import com.github.cooker.pan.repository.CategoryRepository;
import com.github.cooker.pan.repository.ResourceRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminResourceService {

    private static final int MAX_IMPORT_ITEMS = 5000;
    private static final int MAX_ERROR_LINES = 30;

    private final ResourceRepository resourceRepository;
    private final CategoryRepository categoryRepository;

    public AdminResourceService(ResourceRepository resourceRepository, CategoryRepository categoryRepository) {
        this.resourceRepository = resourceRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<PendingResourceDto> listPending() {
        return resourceRepository.findPending();
    }

    public void approve(long id, ApproveResourceRequest body) {
        Long categoryId = body != null ? body.categoryId() : null;
        if (categoryId != null && !categoryRepository.existsById(categoryId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "无效的分类");
        }
        if (resourceRepository.approve(id, categoryId) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "资源不存在或已处理");
        }
    }

    public void reject(long id) {
        if (resourceRepository.reject(id) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "资源不存在或已处理");
        }
    }

    public AdminPublishedPage listPublished(int page, int size, String keyword) {
        if (size > 100) {
            size = 100;
        }
        if (page < 0) {
            page = 0;
        }
        long total = resourceRepository.countPublished(keyword);
        if (total == 0) {
            return new AdminPublishedPage(0, List.of());
        }
        return new AdminPublishedPage(total, resourceRepository.findPublishedPage(page, size, keyword));
    }

    public void deletePublished(long id) {
        if (resourceRepository.deletePublished(id) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "资源不存在或不是已上线状态");
        }
    }

    public long createPublished(AdminCreatePublishedResourceRequest request) {
        Long categoryId = request.categoryId();
        if (categoryId != null && !categoryRepository.existsById(categoryId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "无效的分类");
        }
        String tags = request.tags() == null ? "" : String.join(",", request.tags());
        String content = request.content() == null || request.content().isBlank() ? "" : request.content().trim();
        String url = request.url() == null || request.url().isBlank() ? "" : request.url().trim();
        String type = request.type();
        if (type != null && type.isBlank()) {
            type = null;
        }
        return resourceRepository.createPublished(
            request.title().trim(),
            content,
            type,
            tags,
            url,
            categoryId
        );
    }

    public AdminResourceExportBundle exportPublished() {
        List<AdminResourceExportItem> items =
            resourceRepository.findAllPublishedForExport().stream()
                .map(
                    r ->
                        new AdminResourceExportItem(
                            r.id(),
                            r.title(),
                            r.content() == null ? "" : r.content(),
                            r.type(),
                            r.tags() == null ? "" : r.tags(),
                            r.url() == null ? "" : r.url(),
                            r.categoryId(),
                            r.categoryName(),
                            r.heatScore()))
                .toList();
        return new AdminResourceExportBundle(1, Instant.now(), items);
    }

    public AdminResourceImportResult importPublished(List<AdminResourceImportItem> items) {
        if (items.size() > MAX_IMPORT_ITEMS) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "单次最多导入 " + MAX_IMPORT_ITEMS + " 条");
        }
        int imported = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();
        int index = 0;
        for (AdminResourceImportItem it : items) {
            index++;
            try {
                String title = it.title() == null ? "" : it.title().trim();
                if (title.isEmpty()) {
                    failed++;
                    appendImportError(errors, index, "标题为空");
                    continue;
                }
                Long categoryId = resolveImportCategoryId(it.categoryId(), it.categoryName());
                String content = it.content() == null || it.content().isBlank() ? "" : it.content().trim();
                String type = it.type();
                if (type != null && type.isBlank()) {
                    type = null;
                }
                String tags = it.tags() == null ? "" : it.tags().trim();
                String url = it.url() == null ? "" : it.url().trim();
                int heat = it.heatScore() == null ? 0 : Math.max(0, it.heatScore());
                resourceRepository.createPublished(title, content, type, tags, url, categoryId, heat);
                imported++;
            } catch (Exception e) {
                failed++;
                String msg = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
                appendImportError(errors, index, msg);
            }
        }
        return new AdminResourceImportResult(imported, failed, errors);
    }

    private Long resolveImportCategoryId(Long categoryId, String categoryName) {
        if (categoryId != null && categoryRepository.existsById(categoryId)) {
            return categoryId;
        }
        if (categoryName != null && !categoryName.isBlank()) {
            return categoryRepository.findIdByNameIgnoreCase(categoryName).orElse(null);
        }
        return null;
    }

    private static void appendImportError(List<String> errors, int index, String message) {
        if (errors.size() >= MAX_ERROR_LINES) {
            return;
        }
        errors.add("第 " + index + " 条: " + message);
    }
}
