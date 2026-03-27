package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.HomeStatsResponse;
import com.github.cooker.pan.dto.HotKeywordItem;
import com.github.cooker.pan.dto.SearchRequest;
import com.github.cooker.pan.dto.SearchResponse;
import com.github.cooker.pan.repository.BlockedKeywordRepository;
import com.github.cooker.pan.repository.ResourceRepository;
import com.github.cooker.pan.search.SortBy;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.mapdb.HTreeMap;
import org.springframework.stereotype.Service;

@Service
public class SearchService {

    private final ResourceRepository resourceRepository;
    private final BlockedKeywordRepository blockedKeywordRepository;
    private final HTreeMap<String, Long> hotKeywordCounter;

    public SearchService(
        ResourceRepository resourceRepository,
        BlockedKeywordRepository blockedKeywordRepository,
        HTreeMap<String, Long> hotKeywordCounter
    ) {
        this.resourceRepository = resourceRepository;
        this.blockedKeywordRepository = blockedKeywordRepository;
        this.hotKeywordCounter = hotKeywordCounter;
    }

    public SearchResponse search(SearchRequest request) {
        int page = request.page() == null ? 0 : Math.max(0, request.page());
        int size = request.size() == null ? 20 : Math.min(100, Math.max(1, request.size()));
        SortBy sortBy = parseSortBy(request.sortBy());
        String keyword = request.keyword().trim();
        if (!keyword.isEmpty()) {
            hotKeywordCounter.merge(keyword.toLowerCase(Locale.ROOT), 1L, Long::sum);
        }

        List<String> blocked = blockedKeywordRepository.findAllKeywords();
        return resourceRepository.searchByKeyword(keyword, sortBy, page, size, blocked);
    }

    /** 首页：已上线资源总数 + MapDB 中按检索次数聚合的热门词（关键词为小写存储）。 */
    public HomeStatsResponse homeStats(int hotLimit) {
        int limit = Math.min(30, Math.max(1, hotLimit));
        long total = resourceRepository.countPublished(null);
        List<HotKeywordItem> hot =
            hotKeywordCounter.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .map(e -> new HotKeywordItem(e.getKey(), e.getValue()))
                .toList();
        return new HomeStatsResponse(total, hot);
    }

    private static SortBy parseSortBy(String raw) {
        if (raw == null || raw.isBlank()) {
            return SortBy.RELEVANCE;
        }
        return switch (raw.trim().toLowerCase(Locale.ROOT)) {
            case "time" -> SortBy.TIME;
            case "hot" -> SortBy.HOT;
            default -> SortBy.RELEVANCE;
        };
    }
}
