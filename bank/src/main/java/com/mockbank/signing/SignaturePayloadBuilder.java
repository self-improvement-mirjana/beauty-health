package com.mockbank.signing;

import java.util.StringJoiner;

public final class SignaturePayloadBuilder {

    private SignaturePayloadBuilder() {}

    public static String build(String method, String path, String timestamp, String nonce, String body) {
        StringJoiner joiner = new StringJoiner("\n");
        joiner.add(method.toUpperCase());
        joiner.add(path);
        joiner.add(timestamp);
        joiner.add(nonce);
        joiner.add(body != null ? body : "");
        return joiner.toString();
    }
}
