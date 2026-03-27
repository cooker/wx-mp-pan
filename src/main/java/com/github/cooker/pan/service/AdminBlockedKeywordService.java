package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.ActiveBlockedKeywordDto;
import com.github.cooker.pan.dto.AddBlockedKeywordRequest;
import com.github.cooker.pan.dto.PendingBlockedKeywordDto;
import com.github.cooker.pan.repository.BlockedKeywordRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminBlockedKeywordService {

    private final BlockedKeywordRepository blockedKeywordRepository;

    public AdminBlockedKeywordService(BlockedKeywordRepository blockedKeywordRepository) {
        this.blockedKeywordRepository = blockedKeywordRepository;
    }

    public List<PendingBlockedKeywordDto> listPending() {
        return blockedKeywordRepository.findPending();
    }

    public List<ActiveBlockedKeywordDto> listActive() {
        return blockedKeywordRepository.findActive();
    }

    public long createActive(AddBlockedKeywordRequest request) {
        String normalized = request.keyword().trim().toLowerCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "关键词不能为空");
        }
        if (blockedKeywordRepository.existsByKeyword(normalized)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "该屏蔽词已存在");
        }
        return blockedKeywordRepository.insertActive(normalized);
    }

    public void deleteActive(long id) {
        if (blockedKeywordRepository.deleteActive(id) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "记录不存在或不是已生效屏蔽词");
        }
    }

    public void approve(long id) {
        if (blockedKeywordRepository.approve(id) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "记录不存在或已处理");
        }
    }

    public void reject(long id) {
        if (blockedKeywordRepository.deletePending(id) == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "记录不存在或已处理");
        }
    }
}
