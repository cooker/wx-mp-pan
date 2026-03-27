package com.github.cooker.pan.controller;

import com.github.cooker.pan.dto.ActiveBlockedKeywordDto;
import com.github.cooker.pan.dto.AddBlockedKeywordRequest;
import com.github.cooker.pan.dto.PendingBlockedKeywordDto;
import com.github.cooker.pan.service.AdminBlockedKeywordService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/blocked-keywords")
public class AdminBlockedKeywordController {

    private final AdminBlockedKeywordService adminBlockedKeywordService;

    public AdminBlockedKeywordController(AdminBlockedKeywordService adminBlockedKeywordService) {
        this.adminBlockedKeywordService = adminBlockedKeywordService;
    }

    @GetMapping("/pending")
    public List<PendingBlockedKeywordDto> pending() {
        return adminBlockedKeywordService.listPending();
    }

    @GetMapping("/active")
    public List<ActiveBlockedKeywordDto> active() {
        return adminBlockedKeywordService.listActive();
    }

    @PostMapping("/active")
    public ResponseEntity<Map<String, Long>> createActive(@Valid @RequestBody AddBlockedKeywordRequest request) {
        long id = adminBlockedKeywordService.createActive(request);
        return ResponseEntity.created(URI.create("/api/admin/blocked-keywords/active/" + id)).body(Map.of("id", id));
    }

    @DeleteMapping("/active/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteActive(@PathVariable long id) {
        adminBlockedKeywordService.deleteActive(id);
    }

    @PostMapping("/{id}/approve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void approve(@PathVariable long id) {
        adminBlockedKeywordService.approve(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(@PathVariable long id) {
        adminBlockedKeywordService.reject(id);
    }
}
