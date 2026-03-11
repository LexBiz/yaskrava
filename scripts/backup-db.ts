import "dotenv/config";

import {createWriteStream} from "node:fs";
import {mkdir} from "node:fs/promises";
import path from "node:path";
import {spawn} from "node:child_process";
import {createGzip} from "node:zlib";

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function main() {
  const databaseUrl = process.env.BACKUP_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL or BACKUP_DATABASE_URL is required");
  }

  const outputDir = path.resolve(
    process.cwd(),
    process.env.BACKUP_OUTPUT_DIR || "backups/db"
  );
  await mkdir(outputDir, {recursive: true});

  const outputPath = path.join(outputDir, `postgres-${timestamp()}.sql.gz`);
  const gzip = createGzip({level: 9});
  const output = createWriteStream(outputPath);

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      "pg_dump",
      ["--dbname", databaseUrl, "--format=plain", "--no-owner", "--no-privileges"],
      {
        stdio: ["ignore", "pipe", "pipe"],
      }
    );

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.stdout.pipe(gzip).pipe(output);

    child.on("error", (error) => {
      reject(error);
    });

    output.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `pg_dump exited with code ${code}`));
    });
  });

  console.log(`Database backup created at ${outputPath}`);
}

main().catch((error) => {
  console.error("Database backup failed.", error);
  process.exitCode = 1;
});
