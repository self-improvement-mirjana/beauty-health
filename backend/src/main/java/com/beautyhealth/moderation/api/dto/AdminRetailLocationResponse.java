package com.beautyhealth.moderation.api.dto;

public record AdminRetailLocationResponse(long id, String name, String address, String phone, String hoursText,
        int sortOrder, boolean active) {
}
