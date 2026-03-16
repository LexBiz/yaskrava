
SELECT 'applications' AS type, count(*) AS count
FROM "Application"
WHERE lower(coalesce("fullName", '')) LIKE '%test%'
   OR lower(coalesce(email, '')) LIKE '%example.com%'
   OR lower(coalesce(email, '')) LIKE '%test%';

SELECT 'partner_leads' AS type, count(*) AS count
FROM "PartnerLead"
WHERE lower(coalesce("companyName", '')) LIKE '%test%'
   OR lower(coalesce("contactName", '')) LIKE '%test%'
   OR lower(coalesce(email, '')) LIKE '%example.com%'
   OR lower(coalesce(email, '')) LIKE '%test%';

SELECT 'dealers' AS type, count(*) AS count
FROM "Dealer"
WHERE lower(coalesce(name, '')) LIKE '%test%'
   OR lower(coalesce(name, '')) LIKE '%e2e%'
   OR lower(coalesce(slug, '')) LIKE 'e2e-%';

SELECT 'users' AS type, count(*) AS count
FROM "AdminUser"
WHERE lower(coalesce(email, '')) LIKE '%example.com%'
   OR lower(coalesce(email, '')) LIKE '%test%'
   OR lower(coalesce(email, '')) LIKE '%e2e%';
