package com.github.cooker.pan.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.cooker.pan.dto.AppRecommendationDto;
import com.github.cooker.pan.dto.SiteConfigDto;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class SiteConfigRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public SiteConfigRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public SiteConfigDto load() {
        return jdbcTemplate.query(
            """
                SELECT site_title, header_script, tracking_enabled, tracking_events, app_recommendations
                FROM site_config WHERE id = 1
                """,
            rs -> {
                if (!rs.next()) {
                    return new SiteConfigDto("资源检索系统", null, false, List.of(), List.of());
                }
                return new SiteConfigDto(
                    rs.getString("site_title"),
                    rs.getString("header_script"),
                    rs.getInt("tracking_enabled") == 1,
                    parseEvents(rs.getString("tracking_events")),
                    parseApps(rs.getString("app_recommendations"))
                );
            }
        );
    }

    public void save(
        String siteTitle,
        String headerScript,
        boolean trackingEnabled,
        List<String> trackingEvents,
        List<AppRecommendationDto> appRecommendations
    ) {
        String events = serializeEvents(trackingEvents);
        String appsJson = serializeApps(appRecommendations);
        int n = jdbcTemplate.update(
            """
                UPDATE site_config SET site_title = ?, header_script = ?, tracking_enabled = ?, tracking_events = ?,
                app_recommendations = ? WHERE id = 1
                """,
            siteTitle.trim(),
            headerScript,
            trackingEnabled ? 1 : 0,
            events,
            appsJson
        );
        if (n == 0) {
            jdbcTemplate.update(
                """
                    INSERT OR REPLACE INTO site_config
                      (id, site_title, header_script, tracking_enabled, tracking_events, app_recommendations)
                    VALUES (1, ?, ?, ?, ?, ?)
                    """,
                siteTitle.trim(),
                headerScript,
                trackingEnabled ? 1 : 0,
                events,
                appsJson
            );
        }
    }

    private String serializeApps(List<AppRecommendationDto> apps) {
        if (apps == null || apps.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(apps);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<AppRecommendationDto> parseApps(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        try {
            List<AppRecommendationDto> list = objectMapper.readValue(raw, new TypeReference<>() {});
            return list != null ? List.copyOf(list) : List.of();
        } catch (Exception e) {
            return List.of();
        }
    }

    private static String serializeEvents(List<String> events) {
        if (events == null || events.isEmpty()) {
            return "";
        }
        return events.stream().map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.joining(","));
    }

    private static List<String> parseEvents(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .distinct()
            .toList();
    }
}
