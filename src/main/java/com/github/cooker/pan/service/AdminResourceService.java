package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.AdminCreatePublishedResourceRequest;
import com.github.cooker.pan.dto.AdminPublishedPage;
import com.github.cooker.pan.dto.ApproveResourceRequest;
import com.github.cooker.pan.dto.PendingResourceDto;
import com.github.cooker.pan.repository.CategoryRepository;
import com.github.cooker.pan.repository.ResourceRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminResourceService {

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
}
