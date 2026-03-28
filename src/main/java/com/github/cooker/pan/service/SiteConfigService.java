package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.AdminSiteConfigExportBundle;
import com.github.cooker.pan.dto.AdminSiteConfigImportRequest;
import com.github.cooker.pan.dto.AppRecommendationDto;
import com.github.cooker.pan.dto.SiteConfigDto;
import com.github.cooker.pan.dto.UpdateSiteConfigRequest;
import com.github.cooker.pan.repository.SiteConfigRepository;
import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class SiteConfigService {
    private static final Set<String> TRACKING_EVENT_WHITELIST = Set.of(
        "home_view",
        "search_submit",
        "hot_keyword_click",
        "copy_link_click",
        "submit_resource",
        "submit_blocked_keyword"
    );

    private static final int MAX_APP_RECOMMENDATIONS = 30;

    private static final int EXPORT_FORMAT_VERSION = 1;

    private final SiteConfigRepository siteConfigRepository;

    public SiteConfigService(SiteConfigRepository siteConfigRepository) {
        this.siteConfigRepository = siteConfigRepository;
    }

    public SiteConfigDto get() {
        return siteConfigRepository.load();
    }

    public void update(UpdateSiteConfigRequest request) {
        String script = request.headerScript();
        if (script != null && script.isBlank()) {
            script = null;
        }
        boolean enabled = Boolean.TRUE.equals(request.trackingEnabled());
        List<String> events = normalizeEvents(request.trackingEvents());
        List<AppRecommendationDto> apps = normalizeAppRecommendations(request.appRecommendations());
        siteConfigRepository.save(request.siteTitle(), script, enabled, events, apps);
    }

    public AdminSiteConfigExportBundle exportBundle() {
        return new AdminSiteConfigExportBundle(EXPORT_FORMAT_VERSION, Instant.now(), get());
    }

    public void importFromBundle(AdminSiteConfigImportRequest request) {
        SiteConfigDto cfg = request.siteConfig();
        List<String> events = cfg.trackingEvents() != null ? cfg.trackingEvents() : List.of();
        List<AppRecommendationDto> apps = cfg.appRecommendations() != null ? cfg.appRecommendations() : List.of();
        update(new UpdateSiteConfigRequest(
            cfg.siteTitle().trim(),
            cfg.headerScript(),
            cfg.trackingEnabled(),
            events,
            apps
        ));
    }

    private static List<String> normalizeEvents(List<String> input) {
        if (input == null || input.isEmpty()) {
            return List.of();
        }
        LinkedHashSet<String> picked = new LinkedHashSet<>();
        for (String e : input) {
            if (e == null) {
                continue;
            }
            String k = e.trim();
            if (TRACKING_EVENT_WHITELIST.contains(k)) {
                picked.add(k);
            }
        }
        return List.copyOf(picked);
    }

    private static List<AppRecommendationDto> normalizeAppRecommendations(List<AppRecommendationDto> input) {
        if (input == null || input.isEmpty()) {
            return List.of();
        }
        List<AppRecommendationDto> out = new ArrayList<>();
        for (AppRecommendationDto a : input) {
            if (a == null) {
                continue;
            }
            String dl = a.downloadUrl() != null ? a.downloadUrl().trim() : "";
            if (dl.isEmpty() || !isSafeHttpUrl(dl)) {
                continue;
            }
            if (dl.length() > 2000) {
                dl = dl.substring(0, 2000);
            }
            String icon = a.iconUrl() != null ? a.iconUrl().trim() : "";
            if (!icon.isEmpty()) {
                if (!isSafeHttpUrl(icon)) {
                    icon = "";
                } else if (icon.length() > 2000) {
                    icon = icon.substring(0, 2000);
                }
            }
            String name = a.name() != null ? a.name().trim() : "";
            if (name.length() > 80) {
                name = name.substring(0, 80);
            }
            out.add(new AppRecommendationDto(
                name.isEmpty() ? null : name,
                icon.isEmpty() ? null : icon,
                dl));
            if (out.size() >= MAX_APP_RECOMMENDATIONS) {
                break;
            }
        }
        return List.copyOf(out);
    }

    private static boolean isSafeHttpUrl(String s) {
        try {
            URI u = URI.create(s);
            String scheme = u.getScheme();
            return "http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme);
        } catch (Exception e) {
            return false;
        }
    }
}
