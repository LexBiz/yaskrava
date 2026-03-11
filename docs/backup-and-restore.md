# Backup And Restore

## Goal
This project stores critical data in two places:
- PostgreSQL via Prisma.
- Uploaded vehicle media in `public/uploads`.

To keep the platform recoverable, use both:
- infrastructure-level backups for the production PostgreSQL instance;
- application-level export scripts from this repository.

## Recommended Production Baseline
- Run PostgreSQL on a managed service with automatic snapshots and point-in-time recovery.
- Store `public/uploads` on persistent storage that is included in infrastructure backups.
- Run a daily dealer metrics snapshot so CRM numbers have a historical trail even after data changes.
- Test restore procedures on a non-production environment at least monthly.

## Environment Variables
- `DATABASE_URL`: primary application database.
- `BACKUP_DATABASE_URL`: optional dedicated read-only connection string for backups.
- `BACKUP_OUTPUT_DIR`: optional directory for generated backups. Default paths:
  - `backups/db`
  - `backups/uploads`
- `INTERNAL_CRON_SECRET`: secret used by the internal metrics snapshot endpoint.

## Daily Operations
### 1. Snapshot dealer metrics
Run one of these:

```bash
npm run metrics:snapshot
```

or call the protected internal endpoint:

```bash
curl -X POST \
  -H "Authorization: Bearer $INTERNAL_CRON_SECRET" \
  https://your-domain.example/api/internal/dealer-metrics/snapshot
```

### 2. Back up PostgreSQL

```bash
npm run backup:db
```

This uses `pg_dump`, compresses the dump with gzip, and writes it into `backups/db` unless `BACKUP_OUTPUT_DIR` is set.

Requirements:
- `pg_dump` must be installed on the machine running the backup.
- Prefer a read-only backup user when using `BACKUP_DATABASE_URL`.

### 3. Back up uploads

```bash
npm run backup:uploads
```

This archives `public/uploads` into `backups/uploads`.

### 4. Full application-level backup

```bash
npm run backup:all
```

## Suggested Scheduling
- `metrics:snapshot`: every day shortly after midnight.
- `backup:db`: at least daily, more often if lead volume is high.
- `backup:uploads`: daily.

Example cron layout:

```bash
5 0 * * * cd /path/to/app && npm run metrics:snapshot
20 0 * * * cd /path/to/app && npm run backup:db
35 0 * * * cd /path/to/app && npm run backup:uploads
```

## Restore Procedure
### PostgreSQL
1. Restore to a fresh database, not over the active production database.
2. Decompress the dump.
3. Load it with `psql`.
4. Point a staging instance at the restored database and verify logins, dealers, applications, and vehicles.

Example:

```bash
gunzip -c backups/db/postgres-2026-03-11T00-20-00-000Z.sql.gz | psql "$RESTORE_DATABASE_URL"
```

### Uploads
Restore the archive into the application `public` directory:

```bash
tar -xzf backups/uploads/uploads-2026-03-11T00-35-00-000Z.tar.gz -C public
```

## Restore Validation Checklist
- Admin login works.
- Dealer login works on at least one dealer subdomain.
- Dealer vehicle cards show images/video correctly.
- Public finance application submission works.
- Dealer metrics and admin dealer detail page load without errors.
- Recent applications and financing statuses are present.

## Important Notes
- Application-level scripts do not replace managed database snapshots or point-in-time recovery.
- If production uploads move from local disk to object storage later, update the uploads backup procedure accordingly.
- Keep backup artifacts outside the app server disk when possible, for example on mounted storage or remote backup storage.
