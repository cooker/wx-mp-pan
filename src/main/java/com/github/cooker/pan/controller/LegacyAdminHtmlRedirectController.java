package com.github.cooker.pan.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** 兼容旧书签：历史 {@code .html} 入口重定向到新的 SPA 路径。 */
@Controller
public class LegacyAdminHtmlRedirectController {

    @GetMapping("/admin/login.html")
    public String legacyLogin() {
        return "redirect:/admin/login";
    }

    @GetMapping("/admin/index.html")
    public String legacyDashboard() {
        return "redirect:/admin/dashboard";
    }
}
