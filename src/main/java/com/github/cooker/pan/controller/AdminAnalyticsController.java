package com.github.cooker.pan.controller;

import com.github.cooker.pan.dto.AdminAnalyticsEventsPageDto;
import com.github.cooker.pan.dto.AdminAnalyticsOverviewDto;
import com.github.cooker.pan.service.AdminAnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    public AdminAnalyticsController(AdminAnalyticsService adminAnalyticsService) {
        this.adminAnalyticsService = adminAnalyticsService;
    }

    @GetMapping("/overview")
    public AdminAnalyticsOverviewDto overview() {
        return adminAnalyticsService.overview();
    }

    @GetMapping("/events")
    public AdminAnalyticsEventsPageDto events(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String event,
        @RequestParam(required = false) String keyword
    ) {
        return adminAnalyticsService.eventsPage(page, size, event, keyword);
    }
}
