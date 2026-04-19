package com.beautyhealth.common.money;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class MoneyResponseTest {

    @Test
    void rsdFormatsTwoFractionalDigitsPlainString() {
        MoneyResponse m = MoneyResponse.rsd(new BigDecimal("3600"));
        assertThat(m.amount()).isEqualTo("3600.00");
        assertThat(m.currency()).isEqualTo("RSD");
    }

    @Test
    void rsdHalfUpRounding() {
        assertThat(MoneyResponse.rsd(new BigDecimal("10.125")).amount()).isEqualTo("10.13");
        assertThat(MoneyResponse.rsd(new BigDecimal("10.124")).amount()).isEqualTo("10.12");
    }

    @Test
    void rsdStripsTrailingZerosBeyondScale() {
        assertThat(MoneyResponse.rsd(new BigDecimal("99.9")).amount()).isEqualTo("99.90");
    }

    @Test
    void rsdZero() {
        MoneyResponse m = MoneyResponse.rsd(BigDecimal.ZERO);
        assertThat(m.amount()).isEqualTo("0.00");
        assertThat(m.currency()).isEqualTo("RSD");
    }

    @Test
    void rsdLargePlainNoGrouping() {
        MoneyResponse m = MoneyResponse.rsd(new BigDecimal("1234567.89"));
        assertThat(m.amount()).isEqualTo("1234567.89");
    }
}
