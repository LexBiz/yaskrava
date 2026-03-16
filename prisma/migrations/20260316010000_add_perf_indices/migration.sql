-- Performance indices for scale to 100+ dealers

-- Application: cross-dealer lookups by vehicle and assigned users
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Application_vehicleId_idx" ON "Application"("vehicleId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Application_assignedDealerUserId_idx" ON "Application"("assignedDealerUserId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Application_assignedYaskravaUserId_idx" ON "Application"("assignedYaskravaUserId");

-- FinancingCase: filter by status and assigned user
CREATE INDEX CONCURRENTLY IF NOT EXISTS "FinancingCase_status_idx" ON "FinancingCase"("status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "FinancingCase_assignedYaskravaUserId_status_idx" ON "FinancingCase"("assignedYaskravaUserId", "status");

-- AuditLog: user activity timeline
CREATE INDEX CONCURRENTLY IF NOT EXISTS "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");
