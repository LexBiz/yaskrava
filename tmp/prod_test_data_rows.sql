
SELECT id, "fullName", email, "createdAt"
FROM "Application"
WHERE lower(coalesce("fullName", '')) LIKE '%test%'
   OR lower(coalesce(email, '')) LIKE '%example.com%'
   OR lower(coalesce(email, '')) LIKE '%test%';

SELECT id, name, slug, "createdAt"
FROM "Dealer"
WHERE lower(coalesce(name, '')) LIKE '%test%'
   OR lower(coalesce(name, '')) LIKE '%e2e%'
   OR lower(coalesce(slug, '')) LIKE 'e2e-%';

SELECT id, email, "createdAt"
FROM "AdminUser"
WHERE lower(coalesce(email, '')) LIKE '%example.com%'
   OR lower(coalesce(email, '')) LIKE '%test%'
   OR lower(coalesce(email, '')) LIKE '%e2e%';
