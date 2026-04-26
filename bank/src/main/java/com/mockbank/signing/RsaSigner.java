package com.mockbank.signing;

import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.security.Signature;
import java.util.Base64;

public final class RsaSigner {

    private RsaSigner() {}

    public static String sign(String data, PrivateKey privateKey) {
        try {
            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initSign(privateKey);
            sig.update(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(sig.sign());
        } catch (Exception e) {
            throw new RuntimeException("RSA signing failed", e);
        }
    }

    public static String sign(String data, String privateKeyPem) {
        return sign(data, PemUtils.decodePrivateKey(privateKeyPem));
    }
}
