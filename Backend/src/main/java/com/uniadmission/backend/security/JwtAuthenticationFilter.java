package com.uniadmission.backend.security;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected boolean shouldNotFilter(@org.springframework.lang.NonNull HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            System.out.println("[DEBUG] JwtAuthenticationFilter: extracted jwt='"
                    + (jwt != null ? jwt.substring(0, Math.min(10, jwt.length())) + "..." : "null") + "' from request");
            if (!StringUtils.hasText(jwt)) {
                System.out.println("[DEBUG] JwtAuthenticationFilter: no token provided");
            } else if (tokenProvider.validateToken(jwt)) {
                System.out.println("[DEBUG] JwtAuthenticationFilter: token valid");
                String email = tokenProvider.getUsernameFromJWT(jwt);

                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"Invalid or expired token\"}");
                return;
            }
        } catch (Exception ex) {
            logger.error("Không thể thiết lập xác thực người dùng trong context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        // Fallback: allow token via query parameter for EventSource (SSE) connections
        // Exclude /api/auth/verify-email endpoint from treating query parameter 'token' as JWT
        if (!request.getRequestURI().contains("/api/auth/verify-email")) {
            String tokenParam = request.getParameter("token");
            if (StringUtils.hasText(tokenParam)) {
                return tokenParam;
            }
        }
        String accessTokenParam = request.getParameter("access_token");
        if (StringUtils.hasText(accessTokenParam))
            return accessTokenParam;
        return null;
    }
}
