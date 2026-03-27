package com.github.cooker.pan.repository;

import com.github.cooker.pan.dto.AdminPublishedResourceDto;
import com.github.cooker.pan.dto.PendingResourceDto;
import com.github.cooker.pan.dto.SearchItem;
import com.github.cooker.pan.dto.SearchResponse;
import com.github.cooker.pan.search.SortBy;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ResourceRepository {

    private static final String PUBLISHED = " AND r.status = 1";

    private final JdbcTemplate jdbcTemplate;

    public ResourceRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** 用户提交：待审核 status=0，同步写入 FTS（审核通过前检索不展示，靠 status 过滤） */
    public long create(String title, String content, String type, String tags, String url) {
        Instant now = Instant.now();
        jdbcTemplate.update(
            """
                INSERT INTO resource (title, content, type, tags, url, status, category_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?)
                """,
            title, content, type, tags, url, Timestamp.from(now), Timestamp.from(now)
        );
        long id = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        jdbcTemplate.update(
            "INSERT INTO resource_fts(rowid, title, content, tags) VALUES (?, ?, ?, ?)",
            id, title, content, tags
        );
        return id;
    }

    /** 管理端新增并直接上线，同步写入 FTS。 */
    public long createPublished(String title, String content, String type, String tags, String url, Long categoryId) {
        Instant now = Instant.now();
        jdbcTemplate.update(
            """
                INSERT INTO resource (title, content, type, tags, url, status, category_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
                """,
            title,
            content,
            type,
            tags,
            url,
            categoryId,
            Timestamp.from(now),
            Timestamp.from(now)
        );
        long id = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        jdbcTemplate.update(
            "INSERT INTO resource_fts(rowid, title, content, tags) VALUES (?, ?, ?, ?)",
            id,
            title,
            content,
            tags
        );
        return id;
    }

    public SearchResponse searchByKeyword(String keyword, SortBy sortBy, int page, int size, List<String> blockedKeywords) {
        String query = keyword + "*";
        String blockedClause = buildBlockedClause(blockedKeywords);
        String orderClause = switch (sortBy) {
            case TIME -> "ORDER BY r.created_at DESC, r.id DESC";
            case HOT -> "ORDER BY r.heat_score DESC, r.created_at DESC, r.id DESC";
            case RELEVANCE -> "ORDER BY bm25(resource_fts)";
        };

        List<Object> countArgs = new ArrayList<>();
        countArgs.add(query);
        addBlockedArgs(countArgs, blockedKeywords);
        long total = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(1)
                FROM resource_fts
                JOIN resource r ON r.id = resource_fts.rowid
                WHERE resource_fts MATCH ?
                """
                + PUBLISHED
                + blockedClause,
            Long.class,
            countArgs.toArray()
        );

        List<Object> listArgs = new ArrayList<>();
        listArgs.add(query);
        addBlockedArgs(listArgs, blockedKeywords);
        listArgs.add(size);
        listArgs.add(page * size);

        String listSql = """
                SELECT r.id, r.title, r.type, r.tags, r.url,
                       snippet(resource_fts, 1, '<em>', '</em>', '...', 16) AS highlight,
                       c.name AS category_name, r.heat_score
                FROM resource_fts
                JOIN resource r ON r.id = resource_fts.rowid
                LEFT JOIN category c ON c.id = r.category_id
                WHERE resource_fts MATCH ?
                """
            + PUBLISHED
            + blockedClause
            + "\n"
            + orderClause
            + "\n"
            + """
                LIMIT ? OFFSET ?
                """;

        List<SearchItem> items = jdbcTemplate.query(
            listSql,
            searchRowMapper(),
            listArgs.toArray()
        );
        return new SearchResponse(total, items);
    }

    public List<PendingResourceDto> findPending() {
        return jdbcTemplate.query(
            """
                SELECT id, title, url, content, type, tags, category_id, created_at
                FROM resource
                WHERE status = 0
                ORDER BY created_at ASC, id ASC
                """,
            pendingRowMapper()
        );
    }

    public int approve(long id, Long categoryId) {
        Instant now = Instant.now();
        if (categoryId != null) {
            return jdbcTemplate.update(
                "UPDATE resource SET status = 1, category_id = ?, updated_at = ? WHERE id = ? AND status = 0",
                categoryId,
                Timestamp.from(now),
                id
            );
        }
        return jdbcTemplate.update(
            "UPDATE resource SET status = 1, updated_at = ? WHERE id = ? AND status = 0",
            Timestamp.from(now),
            id
        );
    }

    public int reject(long id) {
        jdbcTemplate.update("DELETE FROM resource_fts WHERE rowid = ?", id);
        return jdbcTemplate.update("DELETE FROM resource WHERE id = ? AND status = 0", id);
    }

    public long countPublished(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            Long n = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM resource WHERE status = 1", Long.class);
            return n == null ? 0L : n;
        }
        String k = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
        Long n = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(1) FROM resource r
                WHERE r.status = 1 AND (
                  LOWER(r.title) LIKE ? OR LOWER(COALESCE(r.url,'')) LIKE ?
                  OR LOWER(COALESCE(r.tags,'')) LIKE ? OR LOWER(COALESCE(r.content,'')) LIKE ?
                )
                """,
            Long.class,
            k,
            k,
            k,
            k
        );
        return n == null ? 0L : n;
    }

    public List<AdminPublishedResourceDto> findPublishedPage(int page, int size, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return jdbcTemplate.query(
                """
                    SELECT r.id, r.title, r.url, r.type, r.tags, r.category_id, c.name AS category_name,
                           r.heat_score, r.created_at, r.updated_at, r.content AS content
                    FROM resource r
                    LEFT JOIN category c ON c.id = r.category_id
                    WHERE r.status = 1
                    ORDER BY r.updated_at DESC, r.id DESC
                    LIMIT ? OFFSET ?
                    """,
                adminPublishedRowMapper(),
                size,
                page * size
            );
        }
        String k = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
        return jdbcTemplate.query(
            """
                SELECT r.id, r.title, r.url, r.type, r.tags, r.category_id, c.name AS category_name,
                       r.heat_score, r.created_at, r.updated_at, r.content AS content
                FROM resource r
                LEFT JOIN category c ON c.id = r.category_id
                WHERE r.status = 1 AND (
                  LOWER(r.title) LIKE ? OR LOWER(COALESCE(r.url,'')) LIKE ?
                  OR LOWER(COALESCE(r.tags,'')) LIKE ? OR LOWER(COALESCE(r.content,'')) LIKE ?
                )
                ORDER BY r.updated_at DESC, r.id DESC
                LIMIT ? OFFSET ?
                """,
            adminPublishedRowMapper(),
            k,
            k,
            k,
            k,
            size,
            page * size
        );
    }

    /** 删除已上线资源（同步移除 FTS） */
    public int deletePublished(long id) {
        jdbcTemplate.update("DELETE FROM resource_fts WHERE rowid = ?", id);
        return jdbcTemplate.update("DELETE FROM resource WHERE id = ? AND status = 1", id);
    }

    /** 首页复制链接等互动：已上线资源热度 +1 */
    public int incrementHeatScorePublished(long id) {
        return jdbcTemplate.update(
            "UPDATE resource SET heat_score = heat_score + 1, updated_at = ? WHERE id = ? AND status = 1",
            Timestamp.from(Instant.now()),
            id
        );
    }

    private RowMapper<AdminPublishedResourceDto> adminPublishedRowMapper() {
        return (rs, rowNum) -> {
            Long catId = rs.getObject("category_id") == null ? null : rs.getLong("category_id");
            String content = rs.getString("content");
            return new AdminPublishedResourceDto(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getString("url"),
                rs.getString("type"),
                rs.getString("tags"),
                catId,
                rs.getString("category_name"),
                rs.getInt("heat_score"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant(),
                content == null ? "" : content
            );
        };
    }

    public List<SearchItem> findByIds(List<Long> ids) {
        if (ids.isEmpty()) {
            return List.of();
        }
        String placeholders = String.join(",", ids.stream().map(x -> "?").toList());
        return jdbcTemplate.query(
            """
                SELECT r.id, r.title, r.type, r.tags, r.url, substr(r.content,1,80) AS highlight,
                       c.name AS category_name, r.heat_score
                FROM resource r
                LEFT JOIN category c ON c.id = r.category_id
                WHERE r.id IN ("""
                + placeholders
                + ") AND r.status = 1",
            searchRowMapper(),
            ids.toArray()
        );
    }

    private static String buildBlockedClause(List<String> blockedKeywords) {
        if (blockedKeywords == null || blockedKeywords.isEmpty()) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (String ignored : blockedKeywords) {
            if (ignored == null || ignored.isBlank()) {
                continue;
            }
            sb.append(
                " AND INSTR(LOWER(COALESCE(r.title,'') || ' ' || COALESCE(r.content,'') || ' ' || COALESCE(r.tags,'')), LOWER(?)) = 0"
            );
        }
        return sb.toString();
    }

    private static void addBlockedArgs(List<Object> args, List<String> blockedKeywords) {
        if (blockedKeywords == null) {
            return;
        }
        for (String b : blockedKeywords) {
            if (b == null || b.isBlank()) {
                continue;
            }
            args.add(b.trim());
        }
    }

    private RowMapper<SearchItem> searchRowMapper() {
        return (rs, rowNum) -> new SearchItem(
            rs.getLong("id"),
            rs.getString("title"),
            rs.getString("type"),
            rs.getString("tags"),
            rs.getString("url"),
            rs.getString("highlight"),
            rs.getString("category_name"),
            rs.getInt("heat_score")
        );
    }

    private RowMapper<PendingResourceDto> pendingRowMapper() {
        return (rs, rowNum) -> {
            String content = rs.getString("content");
            Long cat = rs.getObject("category_id") == null ? null : rs.getLong("category_id");
            return new PendingResourceDto(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getString("url"),
                content == null ? "" : content,
                rs.getString("type"),
                rs.getString("tags"),
                cat,
                rs.getTimestamp("created_at").toInstant()
            );
        };
    }
}
