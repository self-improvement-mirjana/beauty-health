package com.mockbank.common.money;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

public record MoneyResponse(String formatted, BigDecimal raw, String currency) {
    public static MoneyResponse rsd(BigDecimal amount) {
        BigDecimal scaled = amount.setScale(2, RoundingMode.HALF_UP);
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.GERMAN);
        DecimalFormat df = new DecimalFormat("#,##0.00", symbols);
        return new MoneyResponse(df.format(scaled) + " RSD", scaled, "RSD");
    }
}
