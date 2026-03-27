package com.github.cooker.pan.service;

import com.github.cooker.pan.dto.SiteConfigDto;
import com.github.cooker.pan.dto.UpdateSiteConfigRequest;
import com.github.cooker.pan.repository.SiteConfigRepository;
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
        siteConfigRepository.save(request.siteTitle(), script, enabled, events);
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
}
