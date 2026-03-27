package com.github.cooker.pan.controller;

import com.github.cooker.pan.dto.CreateResourceRequest;
import com.github.cooker.pan.service.ResourceService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> create(@Valid @RequestBody CreateResourceRequest request) {
        long id = resourceService.create(request);
        return ResponseEntity.created(URI.create("/api/resources/" + id)).body(Map.of("id", id));
    }

    /** 复制链接成功后增加热度（仅已上线资源） */
    @PostMapping("/{id}/heat")
    public ResponseEntity<Void> incrementHeat(@PathVariable long id) {
        if (!resourceService.incrementHeatPublished(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
