package com.uniadmission.backend.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.Locale;

public enum EntityStatus {
    ACTIVE,
    INACTIVE;

    @JsonCreator
    public static EntityStatus fromValue(String value) {
        if (value == null) {
            return null;
        }

        return EntityStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
    }
}
