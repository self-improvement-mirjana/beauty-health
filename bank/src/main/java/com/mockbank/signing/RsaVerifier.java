package com.mockbank.signing;

import java.nio.charset.StandardCharsets;
import java.security.PublicKey;
import java.security.Signature;
import java.util.Base64;

public final class RsaVerifier {

    private RsaVerifier() {}

    public static boolean verify(String data, String signatureBase64, PublicKey publicKey) {
        try {
            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(publicKey);
            sig.update(data.getBytes(StandardCharsets.UTF_8));
            return sig.verify(Base64.getDecoder().decode(signatureBase64));
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean verify(String data, String signatureBase64, String publicKeyPem) {
        return verify(data, signatureBase64, PemUtils.decodePublicKey(publicKeyPem));
    }
}
