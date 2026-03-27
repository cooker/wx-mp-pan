package com.github.cooker.pan.controller;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminRootController {

    /**
     * 已登录进入管理首页；未登录去登录页。
     */
    @GetMapping("/admin")
    public String adminRoot(Authentication authentication) {
        if (authentication != null
            && authentication.isAuthenticated()
            && !(authentication instanceof AnonymousAuthenticationToken)) {
            return "redirect:/admin/index.html";
        }
        return "redirect:/admin/login.html";
    }
}
