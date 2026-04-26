package com.mockbank.signing;

import java.security.KeyPair;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.UUID;

public final class KeyPairGeneratorUtil {

    private KeyPairGeneratorUtil() {}

    public static KeyPair generateRsaKeyPair() {
        try {
            java.security.KeyPairGenerator kpg = java.security.KeyPairGenerator.getInstance("RSA");
            kpg.initialize(2048, new SecureRandom());
            return kpg.generateKeyPair();
        } catch (Exception e) {
            throw new RuntimeException("RSA keypair generation failed", e);
        }
    }

    public static String fingerprint(PublicKey publicKey) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(publicKey.getEncoded());
            return HexFormat.of().withDelimiter(":").formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException("Fingerprint calculation failed", e);
        }
    }

    public static String generateSerial() {
        return UUID.randomUUID().toString();
    }

    public static String generateHmacSecret() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
