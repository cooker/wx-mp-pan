package com.github.cooker.pan.repository;

import com.github.cooker.pan.dto.ActiveBlockedKeywordDto;
import com.github.cooker.pan.dto.PendingBlockedKeywordDto;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class BlockedKeywordRepository {

    private final JdbcTemplate jdbcTemplate;

    public BlockedKeywordRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * 仅已上线的屏蔽词，用于检索过滤。
     */
    public List<String> findAllKeywords() {
        return jdbcTemplate.query(
            "SELECT keyword FROM blocked_keyword WHERE status = 1 ORDER BY id",
            (rs, rowNum) -> rs.getString("keyword")
        );
    }

    public boolean existsByKeyword(String normalizedKeyword) {
        Integer n = jdbcTemplate.queryForObject(
            "SELECT COUNT(1) FROM blocked_keyword WHERE keyword = ?",
            Integer.class,
            normalizedKeyword
        );
        return n != null && n > 0;
    }

    /** @return new row id，待审核 status=0 */
    public long insert(String normalizedKeyword) {
        Instant now = Instant.now();
        jdbcTemplate.update(
            "INSERT INTO blocked_keyword (keyword, status, created_at) VALUES (?, 0, ?)",
            normalizedKeyword,
            Timestamp.from(now)
        );
        return jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
    }

    public List<PendingBlockedKeywordDto> findPending() {
        return jdbcTemplate.query(
            "SELECT id, keyword, created_at FROM blocked_keyword WHERE status = 0 ORDER BY id ASC",
            pendingRowMapper()
        );
    }

    public List<ActiveBlockedKeywordDto> findActive() {
        return jdbcTemplate.query(
            "SELECT id, keyword, created_at FROM blocked_keyword WHERE status = 1 ORDER BY id DESC",
            activeRowMapper()
        );
    }

    /** 管理端直接新增已生效屏蔽词。 */
    public long insertActive(String normalizedKeyword) {
        Instant now = Instant.now();
        jdbcTemplate.update(
            "INSERT INTO blocked_keyword (keyword, status, created_at) VALUES (?, 1, ?)",
            normalizedKeyword,
            Timestamp.from(now)
        );
        return jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
    }

    public int deleteActive(long id) {
        return jdbcTemplate.update("DELETE FROM blocked_keyword WHERE id = ? AND status = 1", id);
    }

    public int approve(long id) {
        return jdbcTemplate.update("UPDATE blocked_keyword SET status = 1 WHERE id = ? AND status = 0", id);
    }

    public int deletePending(long id) {
        return jdbcTemplate.update("DELETE FROM blocked_keyword WHERE id = ? AND status = 0", id);
    }

    private RowMapper<PendingBlockedKeywordDto> pendingRowMapper() {
        return (rs, rowNum) -> new PendingBlockedKeywordDto(
            rs.getLong("id"),
            rs.getString("keyword"),
            rs.getTimestamp("created_at").toInstant()
        );
    }

    private RowMapper<ActiveBlockedKeywordDto> activeRowMapper() {
        return (rs, rowNum) -> new ActiveBlockedKeywordDto(
            rs.getLong("id"),
            rs.getString("keyword"),
            rs.getTimestamp("created_at").toInstant()
        );
    }
}
