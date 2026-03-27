package com.github.cooker.pan.controller;

import com.github.cooker.pan.dto.AddBlockedKeywordRequest;
import com.github.cooker.pan.service.BlockedKeywordService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/blocked-keywords")
public class BlockedKeywordController {

    private final BlockedKeywordService blockedKeywordService;

    public BlockedKeywordController(BlockedKeywordService blockedKeywordService) {
        this.blockedKeywordService = blockedKeywordService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> add(@Valid @RequestBody AddBlockedKeywordRequest request) {
        return blockedKeywordService.add(request);
    }
}
