package com.github.cooker.pan.controller;

import com.github.cooker.pan.dto.TrackEventRequest;
import com.github.cooker.pan.service.AnalyticsTrackService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/track")
public class TrackController {

    private final AnalyticsTrackService analyticsTrackService;

    public TrackController(AnalyticsTrackService analyticsTrackService) {
        this.analyticsTrackService = analyticsTrackService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void track(@Valid @RequestBody TrackEventRequest request, HttpServletRequest httpRequest) {
        analyticsTrackService.track(
            request,
            httpRequest.getHeader("User-Agent"),
            extractClientIp(httpRequest)
        );
    }

    private static String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            String first = xff.split(",")[0].trim();
            if (!first.isBlank()) {
                return first;
            }
        }
        String xrip = request.getHeader("X-Real-IP");
        if (xrip != null && !xrip.isBlank()) {
            return xrip.trim();
        }
        String remote = request.getRemoteAddr();
        return remote == null ? null : remote.trim();
    }
}
