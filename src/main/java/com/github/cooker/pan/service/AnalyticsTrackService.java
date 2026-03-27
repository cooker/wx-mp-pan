package com.github.cooker.pan.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.cooker.pan.dto.SiteConfigDto;
import com.github.cooker.pan.dto.TrackEventRequest;
import com.github.cooker.pan.repository.AnalyticsEventRepository;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class AnalyticsTrackService {
    private static final Set<String> EVENT_WHITELIST = Set.of(
        "home_view",
        "search_submit",
        "hot_keyword_click",
        "copy_link_click",
        "submit_resource",
        "submit_blocked_keyword"
    );

    private final SiteConfigService siteConfigService;
    private final AnalyticsEventRepository analyticsEventRepository;
    private final ObjectMapper objectMapper;

    public AnalyticsTrackService(
        SiteConfigService siteConfigService,
        AnalyticsEventRepository analyticsEventRepository,
        ObjectMapper objectMapper
    ) {
        this.siteConfigService = siteConfigService;
        this.analyticsEventRepository = analyticsEventRepository;
        this.objectMapper = objectMapper;
    }

    public void track(TrackEventRequest req, String userAgent, String ipAddress) {
        String event = req.event().trim();
        if (!EVENT_WHITELIST.contains(event)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "不支持的事件类型");
        }
        SiteConfigDto cfg = siteConfigService.get();
        if (!cfg.trackingEnabled() || !cfg.trackingEvents().contains(event)) {
            return;
        }
        String propsJson = toJson(req.props());
        if (propsJson.length() > 4000) {
            propsJson = propsJson.substring(0, 4000);
        }
        String path = req.path() == null ? null : req.path().trim();
        String ua = userAgent == null ? null : userAgent.trim();
        String deviceId = req.deviceId() == null ? null : req.deviceId().trim();
        if (deviceId != null && deviceId.length() > 128) {
            deviceId = deviceId.substring(0, 128);
        }
        String ip = ipAddress == null ? null : ipAddress.trim();
        if (ip != null && ip.length() > 128) {
            ip = ip.substring(0, 128);
        }
        analyticsEventRepository.insert(event, propsJson, path, ua, deviceId, ip);
    }

    private String toJson(Map<String, Object> props) {
        if (props == null || props.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(props);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
