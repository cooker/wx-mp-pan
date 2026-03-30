package com.github.cooker.pan.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * 应用就绪后在控制台输出访客首页与管理后台 URL，便于本地或部署后快速打开站点。
 */
@Component
public class SiteEntryStartupLogger {

    private static final Logger log = LoggerFactory.getLogger(SiteEntryStartupLogger.class);

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady(ApplicationReadyEvent event) {
        ApplicationContext ctx = event.getApplicationContext();
        Environment env = ctx.getEnvironment();

        int port = resolvePort(ctx, env);
        String contextPath = normalizeContextPath(env.getProperty("server.servlet.context-path", ""));
        String host = resolveDisplayHost(env.getProperty("server.address"));

        String origin = "http://" + host + ":" + port + contextPath;
        String home = origin + "/";
        String admin = origin + "/admin/index.html";

        log.info("");
        log.info("======== 网站入口 ========");
        log.info("首页: {}", home);
        log.info("管理后台: {}", admin);
        log.info("==========================");
        log.info("");
    }

    private static int resolvePort(ApplicationContext ctx, Environment env) {
        if (ctx instanceof WebServerApplicationContext web) {
            return web.getWebServer().getPort();
        }
        String p = env.getProperty("server.port", "8080");
        try {
            return Integer.parseInt(p);
        } catch (NumberFormatException e) {
            return 8080;
        }
    }

    private static String normalizeContextPath(String raw) {
        if (raw == null || raw.isBlank() || "/".equals(raw.trim())) {
            return "";
        }
        String s = raw.trim();
        if (!s.startsWith("/")) {
            s = "/" + s;
        }
        while (s.length() > 1 && s.endsWith("/")) {
            s = s.substring(0, s.length() - 1);
        }
        return s;
    }

    private static String resolveDisplayHost(String address) {
        if (address == null
            || address.isBlank()
            || "0.0.0.0".equals(address)
            || "::".equals(address)
            || "::0".equals(address)) {
            return "localhost";
        }
        return address;
    }
}
