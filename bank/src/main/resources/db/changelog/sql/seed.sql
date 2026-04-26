-- Bank admin user (password: admin123)
INSERT INTO bank_user (email, password_hash, full_name, enabled, created_at, updated_at)
VALUES ('admin@banka.local', '$2a$10$vpI7RIZjkS0/XejJ7Nf8ZeTCIjANIEFeQwJbH/HtY5uNODiioP/Au', 'Bank Administrator', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO bank_user_role (user_id, role_name)
SELECT bu.id, 'BANK_ADMIN' FROM bank_user bu WHERE bu.email = 'admin@banka.local'
    AND NOT EXISTS (SELECT 1 FROM bank_user_role r WHERE r.user_id = bu.id AND r.role_name = 'BANK_ADMIN');

-- Demo client
INSERT INTO bank_client (full_name, email, tax_id, status, created_at, updated_at)
VALUES ('Demo Korisnik', 'demo@korisnik.rs', '123456789', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Demo virtual card (PAN: 4242424242424242, CVV hash of "123")
INSERT INTO virtual_card (client_id, pan, pan_last4, exp_month, exp_year, cvv_hash, holder_name, balance, currency, status, created_at, updated_at)
SELECT bc.id, '4242424242424242', '4242', 12, 2028,
       '$2a$10$/i3AwKEr0zl8ErA7oIS8bu4iqFm3WiIf5MYTjjRaM9I5ETCEGX3Km',
       'DEMO KORISNIK', 100000.00, 'RSD', 'ACTIVE', NOW(), NOW()
FROM bank_client bc WHERE bc.email = 'demo@korisnik.rs'
    AND NOT EXISTS (SELECT 1 FROM virtual_card vc WHERE vc.pan = '4242424242424242');

-- Demo merchant (beauty-health)
INSERT INTO merchant (name, slug, return_url_success, return_url_failure, webhook_url, signing_mode, status, created_at, updated_at)
VALUES ('Beauty Health Shop', 'beauty-health',
        'http://localhost:5173/payment/return?status=success',
        'http://localhost:5173/payment/return?status=failure',
        'http://localhost:8080/api/v1/payments/webhook',
        'RSA', 'ACTIVE', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
