package com.github.cooker.pan.repository;

import com.github.cooker.pan.dto.CategoryDto;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class CategoryRepository {

    private final JdbcTemplate jdbcTemplate;

    public CategoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CategoryDto> findAllOrdered() {
        return jdbcTemplate.query(
            "SELECT id, name, sort_order, created_at FROM category ORDER BY sort_order ASC, id ASC",
            categoryRowMapper()
        );
    }

    public long insert(String name, int sortOrder) {
        Instant now = Instant.now();
        jdbcTemplate.update(
            "INSERT INTO category (name, sort_order, created_at) VALUES (?, ?, ?)",
            name.trim(),
            sortOrder,
            Timestamp.from(now)
        );
        return jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
    }

    public int update(long id, String name, int sortOrder) {
        return jdbcTemplate.update(
            "UPDATE category SET name = ?, sort_order = ? WHERE id = ?",
            name.trim(),
            sortOrder,
            id
        );
    }

    public int delete(long id) {
        jdbcTemplate.update("UPDATE resource SET category_id = NULL WHERE category_id = ?", id);
        return jdbcTemplate.update("DELETE FROM category WHERE id = ?", id);
    }

    public boolean existsById(long id) {
        Integer n = jdbcTemplate.queryForObject("SELECT COUNT(1) FROM category WHERE id = ?", Integer.class, id);
        return n != null && n > 0;
    }

    private RowMapper<CategoryDto> categoryRowMapper() {
        return (rs, rowNum) -> new CategoryDto(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getInt("sort_order"),
            rs.getTimestamp("created_at").toInstant()
        );
    }
}
