package com.github.cooker.pan.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 将管理端 SPA 路由转发到构建后的 {@code index.html}，由前端路由接管。
 */
@Controller
public class SpaForwardController {

    @GetMapping({"/admin/login", "/admin/dashboard"})
    public String forwardAdminSpa() {
        return "forward:/index.html";
    }
}
