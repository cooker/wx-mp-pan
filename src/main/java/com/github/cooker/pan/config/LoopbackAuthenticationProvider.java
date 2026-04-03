package com.github.cooker.pan.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 自本机环回地址访问时，后台表单登录不校验密码（用户名须与 {@code app.admin.username} 一致）。
 */
@Component
public class LoopbackAuthenticationProvider implements AuthenticationProvider {

    private final UserDetailsService userDetailsService;
    private final String adminUsername;

    public LoopbackAuthenticationProvider(
            UserDetailsService userDetailsService,
            @Value("${app.admin.username:admin}") String adminUsername) {
        this.userDetailsService = userDetailsService;
        this.adminUsername = adminUsername;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (!(authentication instanceof UsernamePasswordAuthenticationToken token)) {
            return null;
        }
        if (!isLoopbackRequest()) {
            return null;
        }
        String name = token.getName();
        if (name == null || !adminUsername.equals(name)) {
            return null;
        }
        UserDetails user = userDetailsService.loadUserByUsername(name);
        return UsernamePasswordAuthenticationToken.authenticated(
                user.getUsername(), null, user.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

    private static boolean isLoopbackRequest() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return false;
        }
        HttpServletRequest req = attrs.getRequest();
        return isLoopbackAddress(req.getRemoteAddr());
    }

    static boolean isLoopbackAddress(String addr) {
        if (addr == null || addr.isBlank()) {
            return false;
        }
        if ("127.0.0.1".equals(addr)) {
            return true;
        }
        if ("::1".equals(addr) || "0:0:0:0:0:0:0:1".equals(addr)) {
            return true;
        }
        // 127.0.0.0/8
        return addr.startsWith("127.");
    }
}
