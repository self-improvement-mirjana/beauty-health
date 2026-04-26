package com.mockbank.signing;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public final class PemUtils {

    private PemUtils() {}

    public static String encodePublicKey(PublicKey key) {
        return "-----BEGIN PUBLIC KEY-----\n"
                + Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(key.getEncoded())
                + "\n-----END PUBLIC KEY-----";
    }

    public static String encodePrivateKey(PrivateKey key) {
        return "-----BEGIN PRIVATE KEY-----\n"
                + Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(key.getEncoded())
                + "\n-----END PRIVATE KEY-----";
    }

    public static PublicKey decodePublicKey(String pem) {
        try {
            String stripped = pem
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] decoded = Base64.getDecoder().decode(stripped);
            return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(decoded));
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid PEM public key", e);
        }
    }

    public static PrivateKey decodePrivateKey(String pem) {
        try {
            String stripped = pem
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] decoded = Base64.getDecoder().decode(stripped);
            return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(decoded));
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid PEM private key", e);
        }
    }
}
