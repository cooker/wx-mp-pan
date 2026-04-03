package com.github.cooker.pan.controller;

import com.github.cooker.pan.dto.AdminCreatePublishedResourceRequest;
import com.github.cooker.pan.dto.AdminPendingPage;
import com.github.cooker.pan.dto.AdminPublishedPage;
import com.github.cooker.pan.dto.AdminResourceExportBundle;
import com.github.cooker.pan.dto.AdminResourceImportRequest;
import com.github.cooker.pan.dto.AdminResourceImportResult;
import com.github.cooker.pan.dto.ApproveResourceRequest;
import com.github.cooker.pan.dto.AdminResourceUpdateRequest;
import com.github.cooker.pan.service.AdminResourceService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/resources")
public class AdminResourceController {

    private final AdminResourceService adminResourceService;

    public AdminResourceController(AdminResourceService adminResourceService) {
        this.adminResourceService = adminResourceService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> createPublished(@Valid @RequestBody AdminCreatePublishedResourceRequest request) {
        long id = adminResourceService.createPublished(request);
        return ResponseEntity.created(URI.create("/api/resources/" + id)).body(Map.of("id", id));
    }

    @GetMapping("/pending")
    public AdminPendingPage pending(@RequestParam(defaultValue = "1") int limit) {
        return adminResourceService.listPending(limit);
    }

    @GetMapping("/published")
    public AdminPublishedPage published(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String keyword
    ) {
        return adminResourceService.listPublished(page, size, keyword);
    }

    /** 全量导出已上线资源为 JSON（含正文、分类名、热度等） */
    @GetMapping("/published/export")
    public AdminResourceExportBundle exportPublished() {
        return adminResourceService.exportPublished();
    }

    /** 批量导入为新的已上线资源（新 id）；分类按 categoryId 或 categoryName 匹配 */
    @PostMapping("/published/import")
    public AdminResourceImportResult importPublished(@Valid @RequestBody AdminResourceImportRequest request) {
        return adminResourceService.importPublished(request.items());
    }

    @DeleteMapping("/published/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePublished(@PathVariable long id) {
        adminResourceService.deletePublished(id);
    }

    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updatePending(@PathVariable long id, @Valid @RequestBody AdminResourceUpdateRequest body) {
        adminResourceService.updatePending(id, body);
    }

    @PatchMapping("/published/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updatePublished(@PathVariable long id, @Valid @RequestBody AdminResourceUpdateRequest body) {
        adminResourceService.updatePublished(id, body);
    }

    @PostMapping("/{id}/approve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void approve(
        @PathVariable long id,
        @RequestBody(required = false) ApproveResourceRequest body
    ) {
        adminResourceService.approve(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(@PathVariable long id) {
        adminResourceService.reject(id);
    }
}
