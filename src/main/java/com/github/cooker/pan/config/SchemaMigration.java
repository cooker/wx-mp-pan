package com.github.cooker.pan.config;

import java.util.List;
import java.util.Map;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaMigration {

    private final JdbcTemplate jdbcTemplate;

    public SchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Adds new columns for older SQLite files created before the field existed.
     */
    @PostConstruct
    public void migrate() {
        ensureCategoryTable();
        ensureSiteConfigTable();
        ensureAnalyticsTable();
        ensureColumn("resource", "heat_score", "INTEGER NOT NULL DEFAULT 0");
        ensureColumn("resource", "category_id", "INTEGER");
        ensureColumn("blocked_keyword", "status", "INTEGER NOT NULL DEFAULT 1");
        ensureColumn("site_config", "tracking_enabled", "INTEGER NOT NULL DEFAULT 0");
        ensureColumn("site_config", "tracking_events", "TEXT");
        ensureColumn("site_config", "app_recommendations", "TEXT");
        ensureColumn("analytics_event", "device_id", "TEXT");
        ensureColumn("analytics_event", "ip_address", "TEXT");
    }

    private void ensureSiteConfigTable() {
        jdbcTemplate.execute(
            """
                CREATE TABLE IF NOT EXISTS site_config (
                  id INTEGER PRIMARY KEY CHECK (id = 1),
                  site_title TEXT NOT NULL DEFAULT '资源检索系统',
                  header_script TEXT,
                  tracking_enabled INTEGER NOT NULL DEFAULT 0,
                  tracking_events TEXT,
                  app_recommendations TEXT
                )
                """
        );
        jdbcTemplate.update(
            """
                INSERT OR IGNORE INTO site_config
                  (id, site_title, header_script)
                VALUES (1, '资源检索系统', NULL)
                """
        );
    }

    private void ensureCategoryTable() {
        jdbcTemplate.execute(
            """
                CREATE TABLE IF NOT EXISTS category (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL UNIQUE,
                  sort_order INTEGER NOT NULL DEFAULT 0,
                  created_at TIMESTAMP NOT NULL
                )
                """
        );
    }

    private void ensureAnalyticsTable() {
        jdbcTemplate.execute(
            """
                CREATE TABLE IF NOT EXISTS analytics_event (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  event TEXT NOT NULL,
                  props_json TEXT,
                  path TEXT,
                  user_agent TEXT,
                  device_id TEXT,
                  ip_address TEXT,
                  created_at TIMESTAMP NOT NULL
                )
                """
        );
    }

    private void ensureColumn(String table, String column, String ddl) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("PRAGMA table_info(" + table + ")");
        boolean exists = rows.stream().anyMatch(row -> column.equalsIgnoreCase(String.valueOf(row.get("name"))));
        if (!exists) {
            jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + ddl);
        }
    }
}
