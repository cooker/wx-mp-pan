package com.github.cooker.pan.repository;

import com.github.cooker.pan.dto.SiteConfigDto;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class SiteConfigRepository {

    private final JdbcTemplate jdbcTemplate;

    public SiteConfigRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public SiteConfigDto load() {
        return jdbcTemplate.query(
            "SELECT site_title, header_script, tracking_enabled, tracking_events FROM site_config WHERE id = 1",
            rs -> {
                if (!rs.next()) {
                    return new SiteConfigDto("资源检索系统", null, false, List.of());
                }
                return new SiteConfigDto(
                    rs.getString("site_title"),
                    rs.getString("header_script"),
                    rs.getInt("tracking_enabled") == 1,
                    parseEvents(rs.getString("tracking_events"))
                );
            }
        );
    }

    public void save(String siteTitle, String headerScript, boolean trackingEnabled, List<String> trackingEvents) {
        String events = serializeEvents(trackingEvents);
        int n = jdbcTemplate.update(
            "UPDATE site_config SET site_title = ?, header_script = ?, tracking_enabled = ?, tracking_events = ? WHERE id = 1",
            siteTitle.trim(),
            headerScript,
            trackingEnabled ? 1 : 0,
            events
        );
        if (n == 0) {
            jdbcTemplate.update(
                "INSERT OR REPLACE INTO site_config (id, site_title, header_script, tracking_enabled, tracking_events) VALUES (1, ?, ?, ?, ?)",
                siteTitle.trim(),
                headerScript,
                trackingEnabled ? 1 : 0,
                events
            );
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
