package com.mockbank.signing;

import java.security.MessageDigest;

public final class HmacVerifier {

    private HmacVerifier() {}

    public static boolean verify(String data, String signatureBase64, String secret) {
        String expected = HmacSigner.sign(data, secret);
        return MessageDigest.isEqual(expected.getBytes(), signatureBase64.getBytes());
    }
}
