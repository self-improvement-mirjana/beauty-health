package com.beautyhealth.catalog.api.dto;

/**
 * Broj aktivnih proizvoda direktno u podkategoriji (za PLP navigaciju kao na Sephora).
 */
public record CategoryChildProductCountRow(String slug, long productCount) {
}
