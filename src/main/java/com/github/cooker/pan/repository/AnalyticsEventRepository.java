package com.github.cooker.pan.repository;

import com.github.cooker.pan.dto.AdminAnalyticsEventItemDto;
import com.github.cooker.pan.dto.AdminAnalyticsGroupedRowDto;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
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

    /**
     * 按 User-Agent 粗分为 android / ios / windows / macos / linux / unknown / other（顺序由上层固定补全）。
     * 判定顺序：空 UA → Android → iOS → Windows → macOS → Linux → 其他（含 Chrome OS 等）。
     */
    public List<AdminAnalyticsGroupedRowDto> aggregateByUserAgentPlatform() {
        return jdbcTemplate.query(
            """
                SELECT group_key, COUNT(*) AS event_count, MAX(created_at) AS last_seen_at
                FROM (
                    SELECT
                        CASE
                            WHEN user_agent IS NULL OR TRIM(COALESCE(user_agent, '')) = '' THEN 'unknown'
                            WHEN LOWER(user_agent) LIKE '%android%' THEN 'android'
                            WHEN user_agent LIKE '%iPhone%'
                                OR user_agent LIKE '%iPad%'
                                OR user_agent LIKE '%iPod%' THEN 'ios'
                            WHEN user_agent LIKE '%Windows NT%'
                                OR user_agent LIKE '%Windows Phone%' THEN 'windows'
                            WHEN user_agent LIKE '%Macintosh%' OR user_agent LIKE '%Mac OS X%' THEN 'macos'
                            WHEN LOWER(user_agent) LIKE '%linux%' THEN 'linux'
                            ELSE 'other'
                        END AS group_key,
                        created_at
                    FROM analytics_event
                ) x
                GROUP BY group_key
                """,
            groupedRowMapper()
        );
    }

    public long countGroupedByIp(String keyword) {
        boolean hasKw = keyword != null && !keyword.isBlank();
        String sql =
            """
                SELECT COUNT(*) FROM (
                  SELECT 1 FROM analytics_event
                  WHERE TRIM(COALESCE(ip_address,'')) <> ''
                """
                + (hasKw ? " AND LOWER(ip_address) LIKE LOWER(?) " : "")
                + """
                  GROUP BY ip_address
                ) t
                """;
        if (hasKw) {
            Long n = jdbcTemplate.queryForObject(sql, Long.class, "%" + keyword.trim() + "%");
            return n == null ? 0L : n;
        }
        Long n = jdbcTemplate.queryForObject(sql, Long.class);
        return n == null ? 0L : n;
    }

    public List<AdminAnalyticsGroupedRowDto> findGroupedByIp(int page, int size, String keyword) {
        int offset = page * size;
        boolean hasKw = keyword != null && !keyword.isBlank();
        String sql =
            """
                SELECT ip_address AS group_key, COUNT(*) AS event_count, MAX(created_at) AS last_seen_at
                FROM analytics_event
                WHERE TRIM(COALESCE(ip_address,'')) <> ''
                """
                + (hasKw ? " AND LOWER(ip_address) LIKE LOWER(?) " : "")
                + """
                GROUP BY ip_address
                ORDER BY event_count DESC, last_seen_at DESC
                LIMIT ? OFFSET ?
                """;
        List<Object> args = new ArrayList<>();
        if (hasKw) {
            args.add("%" + keyword.trim() + "%");
        }
        args.add(size);
        args.add(offset);
        return jdbcTemplate.query(sql, groupedRowMapper(), args.toArray());
    }

    private RowMapper<AdminAnalyticsGroupedRowDto> groupedRowMapper() {
        return (rs, rowNum) -> new AdminAnalyticsGroupedRowDto(
            rs.getString("group_key"),
            rs.getLong("event_count"),
            rs.getTimestamp("last_seen_at").toInstant()
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
