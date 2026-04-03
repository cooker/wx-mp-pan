package com.github.cooker.pan;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.nullValue;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ResourceSearchIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.update("DELETE FROM resource_fts");
        jdbcTemplate.update("DELETE FROM resource");
        jdbcTemplate.update("DELETE FROM blocked_keyword");
        jdbcTemplate.update("DELETE FROM category");
    }

    private void approveResource(long id) throws Exception {
        mockMvc.perform(post("/api/admin/resources/" + id + "/approve").with(user("admin").roles("ADMIN")))
            .andExpect(status().isNoContent());
    }

    private void approveBlockedKeyword(long id) throws Exception {
        mockMvc.perform(post("/api/admin/blocked-keywords/" + id + "/approve").with(user("admin").roles("ADMIN")))
            .andExpect(status().isNoContent());
    }

    @Test
    void shouldCreateResourceAndSearchByKeyword() throws Exception {
        String createBody = """
            {
              "title": "Spring Boot SQLite 指南",
              "url": "https://example.com/docs/1"
            }
            """;

        mockMvc.perform(post("/api/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createBody))
            .andExpect(status().isCreated());

        Long rid = jdbcTemplate.queryForObject(
            "SELECT id FROM resource WHERE title = ?", Long.class, "Spring Boot SQLite 指南");
        approveResource(rid);

        String searchBody = """
            {
              "keyword": "SQLite",
              "page": 0,
              "size": 10
            }
            """;

        mockMvc.perform(post("/api/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(searchBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(1))
            .andExpect(jsonPath("$.items[0].title").value("Spring Boot SQLite 指南"))
            .andExpect(jsonPath("$.items[0].heatScore").value(0))
            .andExpect(jsonPath("$.items[0].categoryName", nullValue()));
    }

    @Test
    void shouldRenderSearchHomePage() throws Exception {
        mockMvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(forwardedUrl("index.html"));

        mockMvc.perform(get("/index.html"))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("id=\"root\"")));
    }

    @Test
    void homeStatsReturnsTotalAndHotKeywords() throws Exception {
        mockMvc.perform(get("/api/home/stats"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalResources").exists())
            .andExpect(jsonPath("$.hotKeywords").isArray());
    }

    @Test
    void publicSiteConfigOk() throws Exception {
        mockMvc.perform(get("/api/site/config"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.siteTitle").exists());
    }

    @Test
    void shouldAddBlockedKeywordAndExcludeFromSearch() throws Exception {
        String resourceBody = """
            {
              "title": "测试条目 block_me_token",
              "url": "https://example.com/x"
            }
            """;
        mockMvc.perform(post("/api/resources").contentType(MediaType.APPLICATION_JSON).content(resourceBody))
            .andExpect(status().isCreated());

        Long rid = jdbcTemplate.queryForObject(
            "SELECT id FROM resource WHERE title = ?", Long.class, "测试条目 block_me_token");
        approveResource(rid);

        mockMvc.perform(post("/api/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"keyword\": \"block_me_token\", \"page\": 0, \"size\": 10}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(1));

        mockMvc.perform(post("/api/blocked-keywords")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"keyword\": \"block_me_token\"}"))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/api/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"keyword\": \"block_me_token\", \"page\": 0, \"size\": 10}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(1));

        Long kwId = jdbcTemplate.queryForObject(
            "SELECT id FROM blocked_keyword WHERE keyword = ?", Long.class, "block_me_token");
        approveBlockedKeyword(kwId);

        mockMvc.perform(post("/api/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"keyword\": \"block_me_token\", \"page\": 0, \"size\": 10}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void shouldSortByTime() throws Exception {
        String first = """
            {
              "title": "sort_time_case 旧资源",
              "url": "https://example.com/old"
            }
            """;
        String second = """
            {
              "title": "sort_time_case 新资源",
              "url": "https://example.com/new"
            }
            """;

        mockMvc.perform(post("/api/resources").contentType(MediaType.APPLICATION_JSON).content(first))
            .andExpect(status().isCreated());
        Thread.sleep(5);
        mockMvc.perform(post("/api/resources").contentType(MediaType.APPLICATION_JSON).content(second))
            .andExpect(status().isCreated());

        Long idOld = jdbcTemplate.queryForObject(
            "SELECT id FROM resource WHERE title = ?", Long.class, "sort_time_case 旧资源");
        Long idNew = jdbcTemplate.queryForObject(
            "SELECT id FROM resource WHERE title = ?", Long.class, "sort_time_case 新资源");
        approveResource(idOld);
        approveResource(idNew);

        String searchBody = """
            {
              "keyword": "sort_time_case",
              "page": 0,
              "size": 10,
              "sortBy": "time"
            }
            """;

        mockMvc.perform(post("/api/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(searchBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].title").value("sort_time_case 新资源"));
    }

    @Test
    void shouldSortByHot() throws Exception {
        String first = """
            {
              "title": "hot_rank_case 低热度资源",
              "url": "https://example.com/cold"
            }
            """;
        String second = """
            {
              "title": "hot_rank_case 高热度资源",
              "url": "https://example.com/hot"
            }
            """;

        mockMvc.perform(post("/api/resources").contentType(MediaType.APPLICATION_JSON).content(first))
            .andExpect(status().isCreated());
        mockMvc.perform(post("/api/resources").contentType(MediaType.APPLICATION_JSON).content(second))
            .andExpect(status().isCreated());

        Long idCold = jdbcTemplate.queryForObject(
            "SELECT id FROM resource WHERE title = ?", Long.class, "hot_rank_case 低热度资源");
        Long idHot = jdbcTemplate.queryForObject(
            "SELECT id FROM resource WHERE title = ?", Long.class, "hot_rank_case 高热度资源");
        approveResource(idCold);
        approveResource(idHot);

        jdbcTemplate.update("UPDATE resource SET heat_score = 10 WHERE title = 'hot_rank_case 高热度资源'");
        jdbcTemplate.update("UPDATE resource SET heat_score = 1 WHERE title = 'hot_rank_case 低热度资源'");

        String searchBody = """
            {
              "keyword": "hot_rank_case",
              "page": 0,
              "size": 10,
              "sortBy": "hot"
            }
            """;

        mockMvc.perform(post("/api/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(searchBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].title").value("hot_rank_case 高热度资源"));
    }

    @Test
    void incrementHeat_incrementsPublishedResourceHeatScore() throws Exception {
        String createBody = """
            {
              "title": "heat_copy_case 资源",
              "url": "https://example.com/hc"
            }
            """;
        mockMvc.perform(post("/api/resources").contentType(MediaType.APPLICATION_JSON).content(createBody))
            .andExpect(status().isCreated());
        Long rid = jdbcTemplate.queryForObject(
            "SELECT id FROM resource WHERE title = ?", Long.class, "heat_copy_case 资源");
        approveResource(rid);

        mockMvc.perform(post("/api/resources/" + rid + "/heat"))
            .andExpect(status().isNoContent());

        Integer heat = jdbcTemplate.queryForObject(
            "SELECT heat_score FROM resource WHERE id = ?", Integer.class, rid);
        assertEquals(1, heat);

        mockMvc.perform(post("/api/resources/999999999/heat"))
            .andExpect(status().isNotFound());
    }
}
