DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email = 'moderator-it@test');
DELETE FROM users WHERE email = 'moderator-it@test';
INSERT INTO users (email, password_hash, full_name, created_at, updated_at)
VALUES (
    'moderator-it@test',
    '$2a$10$mg7HqOCSdizqXvenHzcie.7srqP9mUgJ8/FKTMELa.bv9yTQoG2ua',
    'Integration Moderator',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON r.name = 'MODERATOR' WHERE u.email = 'moderator-it@test';
