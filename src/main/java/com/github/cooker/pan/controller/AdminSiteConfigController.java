package com.github.cooker.pan.controller;

import com.github.cooker.pan.dto.AdminSiteConfigExportBundle;
import com.github.cooker.pan.dto.AdminSiteConfigImportRequest;
import com.github.cooker.pan.dto.SiteConfigDto;
import com.github.cooker.pan.dto.UpdateSiteConfigRequest;
import com.github.cooker.pan.service.SiteConfigService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/site-config")
public class AdminSiteConfigController {

    private final SiteConfigService siteConfigService;

    public AdminSiteConfigController(SiteConfigService siteConfigService) {
        this.siteConfigService = siteConfigService;
    }

    @GetMapping
    public SiteConfigDto get() {
        return siteConfigService.get();
    }

    @PutMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void update(@Valid @RequestBody UpdateSiteConfigRequest request) {
        siteConfigService.update(request);
    }

    @GetMapping("/export")
    public AdminSiteConfigExportBundle export() {
        return siteConfigService.exportBundle();
    }

    @PostMapping("/import")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void importConfig(@Valid @RequestBody AdminSiteConfigImportRequest request) {
        siteConfigService.importFromBundle(request);
    }
}
