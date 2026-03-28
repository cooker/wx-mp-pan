package com.github.cooker.pan.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.lang.NonNull;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.DelegatingAuthenticationEntryPoint;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import java.util.LinkedHashMap;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        LinkedHashMap<RequestMatcher, AuthenticationEntryPoint> map = new LinkedHashMap<>();
        map.put(new AntPathRequestMatcher("/api/admin/**"), new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED));
        DelegatingAuthenticationEntryPoint delegating = new DelegatingAuthenticationEntryPoint(map);
        delegating.setDefaultEntryPoint(new LoginUrlAuthenticationEntryPoint("/admin/login.html"));
        return delegating;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationEntryPoint authenticationEntryPoint) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/admin/login.html", "/admin/perform_login").permitAll()
                .requestMatchers("/admin/css/**", "/admin/js/**").permitAll()
                .requestMatchers("/admin").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/admin/**").authenticated()
                .anyRequest().permitAll()
            )
            .formLogin(form -> form
                .loginPage("/admin/login.html")
                .loginProcessingUrl("/admin/perform_login")
                .defaultSuccessUrl("/admin/index.html", true)
                .failureUrl("/admin/login.html?error")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/admin/logout")
                .logoutSuccessUrl("/admin/login.html?logout")
                .permitAll()
            )
            .exceptionHandling(exception -> exception.authenticationEntryPoint(authenticationEntryPoint));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder(@Value("${app.admin.relax-auth:false}") boolean relaxAuth) {
        if (relaxAuth) {
            return new AcceptAnyPasswordEncoder();
        }
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
        PasswordEncoder encoder,
        @Value("${app.admin.username:admin}") String username,
        @Value("${app.admin.password:}") String rawPassword,
        @Value("${app.admin.relax-auth:false}") boolean relaxAuth
    ) {
        if (!relaxAuth && (rawPassword == null || rawPassword.isBlank())) {
            throw new IllegalStateException("缺少配置 app.admin.password（可通过环境变量 APP_ADMIN_PASSWORD 设置）");
        }
        String secret = relaxAuth ? "__relax__" : rawPassword;
        UserDetails user = User.builder()
            .username(username)
            .password(encoder.encode(secret))
            .roles("ADMIN")
            .build();
        return new InMemoryUserDetailsManager(user);
    }

    /**
     * 仅用于 {@code app.admin.relax-auth=true}（如 profile dev）：校验阶段恒为通过，便于本地调试。
     */
    private static final class AcceptAnyPasswordEncoder implements PasswordEncoder {

        private static final String STORED = "__accept_any__";

        @Override
        public String encode(@NonNull CharSequence rawPassword) {
            return STORED;
        }

        @Override
        public boolean matches(@NonNull CharSequence rawPassword, String encodedPassword) {
            return STORED.equals(encodedPassword);
        }
    }
}
