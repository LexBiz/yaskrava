import {NextResponse} from "next/server";

import {refreshDealerDailyMetrics} from "@/lib/dealerMetrics";

function isAuthorized(request: Request) {
  const expected = process.env.INTERNAL_CRON_SECRET;
  if (!expected) return false;

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const headerToken = request.headers.get("x-yaskrava-cron-secret");

  return bearerToken === expected || headerToken === expected;
}

export async function POST(request: Request) {
  if (!process.env.INTERNAL_CRON_SECRET) {
    return NextResponse.json(
      {error: "INTERNAL_CRON_SECRET is not configured"},
      {status: 503}
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const result = await refreshDealerDailyMetrics();

  return NextResponse.json({
    ok: true,
    snapshotDate: result.snapshotDate.toISOString(),
    processed: result.processed,
  });
}
