import "dotenv/config";

import {refreshDealerDailyMetrics} from "../src/lib/dealerMetrics";
import {prisma} from "../src/lib/prisma";

async function main() {
  const result = await refreshDealerDailyMetrics();
  console.log(
    `Dealer daily metrics snapshot saved for ${result.processed} dealer(s) at ${result.snapshotDate.toISOString()}`
  );
}

main()
  .catch((error) => {
    console.error("Failed to refresh dealer daily metrics.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
