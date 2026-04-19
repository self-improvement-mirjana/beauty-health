package com.beautyhealth.auth.security;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.beautyhealth.auth.domain.AppUser;
import com.beautyhealth.auth.repo.AppUserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;

    public JwtAuthenticationFilter(JwtService jwtService, AppUserRepository appUserRepository) {
        this.jwtService = jwtService;
        this.appUserRepository = appUserRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7).trim();
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            Claims claims = jwtService.parseClaims(token);
            Long uid = claims.get("uid", Long.class);
            if (uid == null) {
                log.debug("JWT without uid claim; continuing as anonymous for {}", request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }
            AppUser user = appUserRepository.findDetailedById(uid).orElse(null);
            if (user == null) {
                log.debug("JWT uid {} not found; continuing as anonymous for {}", uid, request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }
            List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getName()))
                    .toList();
            var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException ex) {
            /*
             * Istekao ili nevažeći Bearer ne sme da blokira javne rute (npr. GET /products): klijent i dalje šalje
             * stari token iz storage-a. Tretiramo zahtev kao neautentifikovan, umesto 401 pre Security authorize.
             */
            log.debug("Invalid or expired JWT for {}: {}", request.getRequestURI(), ex.getMessage());
            filterChain.doFilter(request, response);
            return;
        }
        filterChain.doFilter(request, response);
    }
}
