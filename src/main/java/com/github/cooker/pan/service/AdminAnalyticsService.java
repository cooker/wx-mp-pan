package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.AdminAnalyticsEventsPageDto;
import com.github.cooker.pan.dto.AdminAnalyticsOverviewDto;
import com.github.cooker.pan.repository.AnalyticsEventRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminAnalyticsService {

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
        if (page < 0) {
            page = 0;
        }
        if (size <= 0) {
            size = 20;
        }
        if (size > 100) {
            size = 100;
        }
        long total = analyticsEventRepository.countFiltered(event, keyword);
        if (total == 0) {
            return new AdminAnalyticsEventsPageDto(0, java.util.List.of());
        }
        return new AdminAnalyticsEventsPageDto(
            total,
            analyticsEventRepository.findPage(page, size, event, keyword)
        );
    }
}
