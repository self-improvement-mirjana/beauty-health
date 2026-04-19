-- B09 seed: informativne stranice (spec. odjeljak 9), maloprodajne lokacije (spec. 8), blog (read MVP).
-- Slug-ovi mapiraju footer linkove; telo je markdown (front render bezbedno).

INSERT INTO retail_location (id, name, address, phone, hours_text, sort_order, is_active, created_at, updated_at) VALUES
(1, 'Beauty & Health — Ušće', 'Bulevar Mihajla Pupina 4, Beograd (TC Ušće)', '011/000-0001', 'Pon–Ned 10:00–22:00', 1, true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00'),
(2, 'Beauty & Health — Delta City', 'Jurija Gagarina 16, Beograd (TC Delta City)', '011/000-0002', 'Pon–Ned 10:00–22:00', 2, true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00');

INSERT INTO cms_page (id, slug, title, body_markdown, published, created_at, updated_at) VALUES
(1, 'cesto-postavljana-pitanja', 'Najčešće postavljana pitanja', '# FAQ\n\nStub sadržaja (B09).', true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00'),
(2, 'kako-poruciti', 'Kako poručiti?', '# Kako poručiti\n\nStub sadržaja (B09).', true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00'),
(3, 'nacini-placanja', 'Načini plaćanja', '# Načini plaćanja\n\nStub: pouzeće (B07).', true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00'),
(4, 'uslovi-kupovine', 'Uslovi kupovine', '# Uslovi kupovine\n\nStub pravnog teksta.', true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00'),
(5, 'isporuka', 'Isporuka', '# Isporuka\n\nRokovi i način isporuke (stub).', true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00'),
(6, 'odustanak-od-ugovora', 'Odustanak od ugovora', '# Odustanak od ugovora\n\nStub (pravni tekst).', true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00'),
(7, 'pravilnik-o-reklamaciji', 'Pravilnik o reklamaciji', '# Reklamacije\n\nStub sadržaja.', true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00'),
(8, 'ostecenje-robe', 'Oštećenje robe', '# Oštećenje robe\n\nKontaktirajte podršku.', true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00'),
(9, 'politika-privatnosti-i-kolacici', 'Politika privatnosti i kolačići', '# Privatnost\n\nOpis obrade podataka (stub).', true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00'),
(10, 'kontakt', 'Kontakt', '# Kontakt\n\nOnline podrška: **podrska@beauty-health.example**', true, TIMESTAMP '2026-01-01 12:00:00', TIMESTAMP '2026-01-01 12:00:00');

INSERT INTO blog_post (id, slug, title, excerpt, body_markdown, published, published_at, created_at, updated_at) VALUES
(1, 'novi-katalog-prolece-2026', 'Novi katalog za proleće 2026', 'Pregled noviteta u ponudi.', '# Novi katalog\n\nKratka vest (stub).', true, TIMESTAMP '2026-03-01 10:00:00', TIMESTAMP '2026-03-01 10:00:00', TIMESTAMP '2026-03-01 10:00:00'),
(2, 'saveti-za-negu-koze', 'Saveti za negu kože', 'Kratki vodič za svakodnevnu negu.', '# Nega kože\n\nStub članka (B09).', true, TIMESTAMP '2026-03-15 11:00:00', TIMESTAMP '2026-03-15 11:00:00', TIMESTAMP '2026-03-15 11:00:00');
