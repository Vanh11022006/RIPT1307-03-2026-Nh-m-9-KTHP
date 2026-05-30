package com.uniadmission.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
@RequiredArgsConstructor
@Slf4j
public class ApplicationDraftSchemaFix implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE applications MODIFY COLUMN status VARCHAR(32) NOT NULL");
            jdbcTemplate.execute("ALTER TABLE applications MODIFY COLUMN submission_date TIMESTAMP NULL");
            log.info("Application draft schema fix applied successfully");
        } catch (Exception ex) {
            log.warn("Skipping application draft schema fix: {}", ex.getMessage());
        }
    }
}
