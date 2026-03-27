package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.CreateResourceRequest;
import com.github.cooker.pan.repository.ResourceRepository;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public long create(CreateResourceRequest request) {
        String tags = request.tags() == null ? "" : String.join(",", request.tags());
        String content = request.content() == null || request.content().isBlank() ? "" : request.content().trim();
        String url = request.url() == null || request.url().isBlank() ? "" : request.url().trim();
        return resourceRepository.create(
            request.title().trim(),
            content,
            request.type(),
            tags,
            url
        );
    }

    /** @return 是否更新到已上线资源 */
    public boolean incrementHeatPublished(long id) {
        return resourceRepository.incrementHeatScorePublished(id) > 0;
    }
}
