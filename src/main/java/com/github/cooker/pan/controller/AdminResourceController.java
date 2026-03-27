package com.github.cooker.pan.controller;

import com.github.cooker.pan.dto.AdminCreatePublishedResourceRequest;
import com.github.cooker.pan.dto.AdminPublishedPage;
import com.github.cooker.pan.dto.ApproveResourceRequest;
import com.github.cooker.pan.dto.PendingResourceDto;
import com.github.cooker.pan.service.AdminResourceService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
    public List<PendingResourceDto> pending() {
        return adminResourceService.listPending();
    }

    @GetMapping("/published")
    public AdminPublishedPage published(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String keyword
    ) {
        return adminResourceService.listPublished(page, size, keyword);
    }

    @DeleteMapping("/published/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePublished(@PathVariable long id) {
        adminResourceService.deletePublished(id);
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
