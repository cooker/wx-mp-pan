package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.AddBlockedKeywordRequest;
import com.github.cooker.pan.repository.BlockedKeywordRepository;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BlockedKeywordService {

    private final BlockedKeywordRepository blockedKeywordRepository;

    public BlockedKeywordService(BlockedKeywordRepository blockedKeywordRepository) {
        this.blockedKeywordRepository = blockedKeywordRepository;
    }

    public ResponseEntity<Map<String, Object>> add(AddBlockedKeywordRequest request) {
        String normalized = request.keyword().trim().toLowerCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "keyword is empty");
        }
        if (blockedKeywordRepository.existsByKeyword(normalized)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "duplicate", true,
                "message", "该屏蔽词已存在"
            ));
        }
        long id = blockedKeywordRepository.insert(normalized);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id", id,
            "pending", true,
            "message", "已提交审核，通过后生效"
        ));
    }
}
