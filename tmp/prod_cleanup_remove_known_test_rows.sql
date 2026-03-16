
DELETE FROM "Application" WHERE id = 'cmmiwj9kh0000n96gga1a6pdm';
DELETE FROM "Dealer" WHERE slug = 'e2e-dealer-181043';
DELETE FROM "AdminUser" WHERE email = 'e2e-owner-181043@example.com';
SELECT count(*) AS remaining_apps FROM "Application" WHERE id = 'cmmiwj9kh0000n96gga1a6pdm';
SELECT count(*) AS remaining_dealers FROM "Dealer" WHERE slug = 'e2e-dealer-181043';
SELECT count(*) AS remaining_users FROM "AdminUser" WHERE email = 'e2e-owner-181043@example.com';
