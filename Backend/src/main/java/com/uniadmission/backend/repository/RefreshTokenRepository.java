package com.uniadmission.backend.repository;

import com.uniadmission.backend.entity.RefreshToken;
import com.uniadmission.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    Optional<RefreshToken> findByUser(User user);

    @Transactional
    void deleteByUser(User user);
}
