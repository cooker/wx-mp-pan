package com.github.cooker.pan.controller;

import com.github.cooker.pan.dto.SiteConfigDto;
import com.github.cooker.pan.service.SiteConfigService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/site")
public class SiteConfigController {

    private final SiteConfigService siteConfigService;

    public SiteConfigController(SiteConfigService siteConfigService) {
        this.siteConfigService = siteConfigService;
    }

    @GetMapping("/config")
    public SiteConfigDto config() {
        return siteConfigService.get();
    }
}
