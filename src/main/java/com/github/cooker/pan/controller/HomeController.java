package com.github.cooker.pan.controller;

import com.github.cooker.pan.dto.HomeStatsResponse;
import com.github.cooker.pan.service.SearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final SearchService searchService;

    public HomeController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/stats")
    public HomeStatsResponse stats(@RequestParam(defaultValue = "10") int hotLimit) {
        return searchService.homeStats(hotLimit);
    }
}
