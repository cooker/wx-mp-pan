package com.github.cooker.pan.repository;

import com.github.cooker.pan.dto.AdminAnalyticsEventItemDto;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AnalyticsEventRepository {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsEventRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void insert(String event, String propsJson, String path, String userAgent, String deviceId, String ipAddress) {
        jdbcTemplate.update(
            "INSERT INTO analytics_event(event, props_json, path, user_agent, device_id, ip_address, created_at) VALUES(?, ?, ?, ?, ?, ?, ?)",
            event,
            propsJson,
            path,
            userAgent,
            deviceId,
            ipAddress,
            Timestamp.from(Instant.now())
        );
    }

    public long countAll() {
        Long n = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM analytics_event", Long.class);
        return n == null ? 0L : n;
    }

    public long countByEvent(String event) {
        Long n = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM analytics_event WHERE event = ?",
            Long.class,
            event
        );
        return n == null ? 0L : n;
    }

    public long countByEventLike(String event, String keyword) {
        String k = "%" + keyword + "%";
        Long n = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM analytics_event WHERE event = ? AND LOWER(COALESCE(props_json,'')) LIKE LOWER(?)",
            Long.class,
            event,
            k
        );
        return n == null ? 0L : n;
    }

    public long countFiltered(String event, String keyword) {
        if ((event == null || event.isBlank()) && (keyword == null || keyword.isBlank())) {
            return countAll();
        }
        if (event != null && !event.isBlank() && keyword != null && !keyword.isBlank()) {
            return countByEventLike(event, keyword);
        }
        if (event != null && !event.isBlank()) {
            return countByEvent(event);
        }
        String k = "%" + keyword + "%";
        Long n = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM analytics_event WHERE LOWER(COALESCE(props_json,'')) LIKE LOWER(?)",
            Long.class,
            k
        );
        return n == null ? 0L : n;
    }

    public List<AdminAnalyticsEventItemDto> findPage(int page, int size, String event, String keyword) {
        int offset = page * size;
        if ((event == null || event.isBlank()) && (keyword == null || keyword.isBlank())) {
            return jdbcTemplate.query(
                """
                    SELECT id, event, path, props_json, user_agent, device_id, ip_address, created_at
                    FROM analytics_event
                    ORDER BY id DESC
                    LIMIT ? OFFSET ?
                    """,
                rowMapper(),
                size,
                offset
            );
        }
        if (event != null && !event.isBlank() && keyword != null && !keyword.isBlank()) {
            String k = "%" + keyword + "%";
            return jdbcTemplate.query(
                """
                    SELECT id, event, path, props_json, user_agent, device_id, ip_address, created_at
                    FROM analytics_event
                    WHERE event = ? AND LOWER(COALESCE(props_json,'')) LIKE LOWER(?)
                    ORDER BY id DESC
                    LIMIT ? OFFSET ?
                    """,
                rowMapper(),
                event,
                k,
                size,
                offset
            );
        }
        if (event != null && !event.isBlank()) {
            return jdbcTemplate.query(
                """
                    SELECT id, event, path, props_json, user_agent, device_id, ip_address, created_at
                    FROM analytics_event
                    WHERE event = ?
                    ORDER BY id DESC
                    LIMIT ? OFFSET ?
                    """,
                rowMapper(),
                event,
                size,
                offset
            );
        }
        String k = "%" + keyword + "%";
        return jdbcTemplate.query(
            """
                SELECT id, event, path, props_json, user_agent, device_id, ip_address, created_at
                FROM analytics_event
                WHERE LOWER(COALESCE(props_json,'')) LIKE LOWER(?)
                ORDER BY id DESC
                LIMIT ? OFFSET ?
                """,
            rowMapper(),
            k,
            size,
            offset
        );
    }

    private RowMapper<AdminAnalyticsEventItemDto> rowMapper() {
        return (rs, rowNum) -> new AdminAnalyticsEventItemDto(
            rs.getLong("id"),
            rs.getString("event"),
            rs.getString("path"),
            rs.getString("props_json"),
            rs.getString("user_agent"),
            rs.getString("device_id"),
            rs.getString("ip_address"),
            rs.getTimestamp("created_at").toInstant()
        );
    }
}
