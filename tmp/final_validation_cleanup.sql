
DELETE FROM "Application" WHERE "fullName" = 'Validation Lead 898474';
DELETE FROM "PartnerLead" WHERE "companyName" = 'Validation Dealer 898474';
DELETE FROM "Dealer" WHERE slug = 'validation-dealer-898474';
DELETE FROM "AdminUser" WHERE email = 'validation-898474@example.com';
DELETE FROM "Vehicle" WHERE title = 'Validation Vehicle 898474';
SELECT count(*) AS remaining_apps FROM "Application" WHERE "fullName" = 'Validation Lead 898474';
SELECT count(*) AS remaining_partner_leads FROM "PartnerLead" WHERE "companyName" = 'Validation Dealer 898474';
SELECT count(*) AS remaining_dealers FROM "Dealer" WHERE slug = 'validation-dealer-898474';
SELECT count(*) AS remaining_users FROM "AdminUser" WHERE email = 'validation-898474@example.com';
SELECT count(*) AS remaining_vehicles FROM "Vehicle" WHERE title = 'Validation Vehicle 898474';
