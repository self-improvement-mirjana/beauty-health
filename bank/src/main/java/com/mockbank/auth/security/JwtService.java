package com.mockbank.auth.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.mockbank.auth.domain.BankUser;
import com.mockbank.config.BankProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(BankProperties props) {
        this.key = Keys.hmacShaKeyFor(props.getJwt().getSecret().getBytes());
        this.expirationMs = props.getJwt().getExpirationMinutes() * 60_000L;
    }

    public String generateToken(BankUser user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        try { return parseClaims(token).getSubject(); }
        catch (Exception e) { return null; }
    }

    public boolean isValid(String token, BankUser user) {
        try {
            Claims claims = parseClaims(token);
            return claims.getSubject().equals(user.getEmail()) && claims.getExpiration().after(new Date());
        } catch (Exception e) { return false; }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
