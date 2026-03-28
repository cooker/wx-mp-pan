package com.github.cooker.pan;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AdminSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginPageIsPublic() throws Exception {
        mockMvc.perform(get("/admin/login.html"))
            .andExpect(status().isOk());
    }

    @Test
    void dashboardRedirectsToLoginWhenAnonymous() throws Exception {
        mockMvc.perform(get("/admin/index.html"))
            .andExpect(status().isFound())
            .andExpect(redirectedUrl("http://localhost/admin/login.html"));
    }

    @Test
    void dashboardOkWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/admin/index.html").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk());
    }

    @Test
    void adminApiUnauthorizedWhenAnonymous() throws Exception {
        mockMvc.perform(get("/api/admin/categories"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void adminRootRedirectsToLoginWhenAnonymous() throws Exception {
        mockMvc.perform(get("/admin"))
            .andExpect(status().isFound())
            .andExpect(redirectedUrl("/admin/login.html"));
    }

    @Test
    void adminRootRedirectsToDashboardWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/admin").with(user("admin").roles("ADMIN")))
            .andExpect(status().isFound())
            .andExpect(redirectedUrl("/admin/index.html"));
    }

    @Test
    void publishedResourcesApiOkWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/resources/published").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").exists())
            .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    void createPublishedResourceApiCreatedWhenAuthenticated() throws Exception {
        mockMvc.perform(
                post("/api/admin/resources")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"title\":\"管理端新增测试资源\",\"url\":\"https://example.com\"}")
                    .with(user("admin").roles("ADMIN")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void activeBlockedKeywordsApiOkWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/blocked-keywords/active").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }

    @Test
    void siteConfigApiOkWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/site-config").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.siteTitle").exists());
    }

    @Test
    void siteConfigPutNoContentWhenAuthenticated() throws Exception {
        mockMvc.perform(
                put("/api/admin/site-config")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"siteTitle\":\"测试站点\",\"headerScript\":null}")
                    .with(user("admin").roles("ADMIN")))
            .andExpect(status().isNoContent());
    }

    @Test
    void siteConfigExportOkWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/site-config/export").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.version").exists())
            .andExpect(jsonPath("$.siteConfig.siteTitle").exists());
    }

    @Test
    void siteConfigImportNoContentWhenAuthenticated() throws Exception {
        String body =
            """
                {"version":1,"siteConfig":{"siteTitle":"导入测试站","headerScript":null,"trackingEnabled":false,"trackingEvents":[],"appRecommendations":[]}}
                """;
        mockMvc.perform(post("/api/admin/site-config/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(user("admin").roles("ADMIN")))
            .andExpect(status().isNoContent());
    }

    @Test
    void analyticsApiOkWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/analytics/overview").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalEvents").exists());

        mockMvc.perform(get("/api/admin/analytics/events").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").exists())
            .andExpect(jsonPath("$.items").isArray());

        mockMvc.perform(get("/api/admin/analytics/by-device").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").exists())
            .andExpect(jsonPath("$.items").isArray())
            .andExpect(jsonPath("$.items.length()").value(7));

        mockMvc.perform(get("/api/admin/analytics/by-ip").with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").exists())
            .andExpect(jsonPath("$.items").isArray());
    }
}
