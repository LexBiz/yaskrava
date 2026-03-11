import "dotenv/config";

import {access, mkdir, writeFile} from "node:fs/promises";
import path from "node:path";
import {spawn} from "node:child_process";
import {constants} from "node:fs";

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function pathExists(targetPath: string) {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const sourceDir = path.resolve(process.cwd(), "public/uploads");
  const outputDir = path.resolve(
    process.cwd(),
    process.env.BACKUP_OUTPUT_DIR || "backups/uploads"
  );
  await mkdir(outputDir, {recursive: true});

  const outputPath = path.join(outputDir, `uploads-${timestamp()}.tar.gz`);

  if (!(await pathExists(sourceDir))) {
    const emptyBackupPath = path.join(outputDir, `uploads-${timestamp()}-empty.json`);
    await writeFile(
      emptyBackupPath,
      JSON.stringify(
        {
          ok: true,
          message: "No uploads directory exists yet.",
          sourceDir,
          createdAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log(`Uploads directory is empty; wrote marker file ${emptyBackupPath}`);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawn("tar", ["-czf", outputPath, "-C", path.resolve(process.cwd(), "public"), "uploads"], {
      stdio: ["ignore", "ignore", "pipe"],
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `tar exited with code ${code}`));
    });
  });

  console.log(`Uploads backup created at ${outputPath}`);
}

main().catch((error) => {
  console.error("Uploads backup failed.", error);
  process.exitCode = 1;
});
