package com.uniadmission.backend.service.impl;

import com.uniadmission.backend.dto.request.LoginRequest;
import com.uniadmission.backend.dto.request.RegisterRequest;
import com.uniadmission.backend.dto.response.AuthResponse;
import com.uniadmission.backend.entity.User;
import com.uniadmission.backend.repository.UserRepository;
import com.uniadmission.backend.security.JwtTokenProvider;
import com.uniadmission.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtTokenProvider tokenProvider;

        @Override
        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email đã được sử dụng!");
                }

                User user = new User();
                user.setFullName(request.getFullName());
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setRole("candidate");
                user.setStatus("active");

                userRepository.save(user);

                return AuthResponse.builder()
                                .token(null)
                                .user(user)
                                .build();
        }

        @Override
        public AuthResponse login(LoginRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                String jwt = tokenProvider.generateToken(authentication);

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

                return AuthResponse.builder()
                                .token(jwt)
                                .user(user)
                                .build();
        }
}
