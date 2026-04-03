package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.AdminAnalyticsEventsPageDto;
import com.github.cooker.pan.dto.AdminAnalyticsGroupedPageDto;
import com.github.cooker.pan.dto.AdminAnalyticsGroupedRowDto;
import com.github.cooker.pan.dto.AdminAnalyticsOverviewDto;
import com.github.cooker.pan.repository.AnalyticsEventRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class AdminAnalyticsService {

    /** 设备视图展示顺序（与产品文案：安卓、iOS、Windows、macOS、Linux 一致）。 */
    private static final List<String> PLATFORM_ORDER =
        List.of("android", "ios", "windows", "macos", "linux", "unknown", "other");

    private final AnalyticsEventRepository analyticsEventRepository;

    public AdminAnalyticsService(AnalyticsEventRepository analyticsEventRepository) {
        this.analyticsEventRepository = analyticsEventRepository;
    }

    public AdminAnalyticsOverviewDto overview() {
        return new AdminAnalyticsOverviewDto(
            analyticsEventRepository.countAll(),
            analyticsEventRepository.countByEvent("home_view"),
            analyticsEventRepository.countByEvent("search_submit"),
            analyticsEventRepository.countByEvent("hot_keyword_click"),
            analyticsEventRepository.countByEvent("copy_link_click"),
            analyticsEventRepository.countByEvent("submit_resource"),
            analyticsEventRepository.countByEvent("submit_blocked_keyword")
        );
    }

    public AdminAnalyticsEventsPageDto eventsPage(int page, int size, String event, String keyword) {
        int[] ps = normalizePage(page, size);
        page = ps[0];
        size = ps[1];
        long total = analyticsEventRepository.countFiltered(event, keyword);
        if (total == 0) {
            return new AdminAnalyticsEventsPageDto(0, List.of());
        }
        return new AdminAnalyticsEventsPageDto(
            total,
            analyticsEventRepository.findPage(page, size, event, keyword)
        );
    }

    /**
     * 按 UA 归类系统类型统计；固定返回 7 行（含事件数为 0 的类别）。total 为各类事件数之和（等于库中事件总条数）。
     */
    public AdminAnalyticsGroupedPageDto platformStatsByUserAgent() {
        List<AdminAnalyticsGroupedRowDto> raw = analyticsEventRepository.aggregateByUserAgentPlatform();
        Map<String, AdminAnalyticsGroupedRowDto> fromDb = new HashMap<>();
        for (AdminAnalyticsGroupedRowDto row : raw) {
            fromDb.put(row.groupKey(), row);
        }
        List<AdminAnalyticsGroupedRowDto> items = new ArrayList<>();
        long sum = 0L;
        for (String code : PLATFORM_ORDER) {
            AdminAnalyticsGroupedRowDto row = fromDb.get(code);
            if (row != null) {
                items.add(row);
                sum += row.eventCount();
            } else {
                items.add(new AdminAnalyticsGroupedRowDto(code, 0L, null));
            }
        }
        return new AdminAnalyticsGroupedPageDto(sum, items);
    }

    public AdminAnalyticsGroupedPageDto ipGroupsPage(int page, int size, String keyword) {
        int[] ps = normalizePage(page, size);
        page = ps[0];
        size = ps[1];
        long total = analyticsEventRepository.countGroupedByIp(keyword);
        if (total == 0) {
            return new AdminAnalyticsGroupedPageDto(0, List.of());
        }
        return new AdminAnalyticsGroupedPageDto(
            total,
            analyticsEventRepository.findGroupedByIp(page, size, keyword)
        );
    }

    private static int[] normalizePage(int page, int size) {
        if (page < 0) {
            page = 0;
        }
        if (size <= 0) {
            size = 20;
        }
        if (size > 100) {
            size = 100;
        }
        return new int[] {page, size};
    }
}
