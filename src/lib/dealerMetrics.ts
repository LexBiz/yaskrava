import "server-only";

import {prisma} from "@/lib/prisma";

const APPROVED_FINANCING_STATUSES = new Set(["APPROVED", "FUNDED"]);
const REJECTED_FINANCING_STATUS = "REJECTED";

export type DealerMetricSummary = {
  dealerId: string;
  vehicleCount: number;
  applicationsTotal: number;
  applicationsApproved: number;
  applicationsRejected: number;
  latestSnapshotDate: Date | null;
};

function createEmptyMetric(dealerId: string): DealerMetricSummary {
  return {
    dealerId,
    vehicleCount: 0,
    applicationsTotal: 0,
    applicationsApproved: 0,
    applicationsRejected: 0,
    latestSnapshotDate: null,
  };
}

function normalizeSnapshotDate(input: Date) {
  return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
}

export async function getDealerMetricsMap(dealerIds?: string[]) {
  const dealerFilter =
    dealerIds && dealerIds.length ? {dealerId: {in: dealerIds}} : undefined;

  const [vehiclesByDealer, applicationsByDealer, financingByDealer, latestSnapshots] =
    await Promise.all([
      prisma.vehicle.groupBy({
        by: ["dealerId"],
        where: {
          deletedAt: null,
          ...(dealerFilter || {}),
        },
        _count: {_all: true},
      }),
      prisma.application.groupBy({
        by: ["dealerId"],
        where: {
          deletedAt: null,
          ...(dealerFilter || {}),
        },
        _count: {_all: true},
      }),
      prisma.application.groupBy({
        by: ["dealerId", "financingStatus"],
        where: {
          deletedAt: null,
          ...(dealerFilter || {}),
          financingStatus: {in: ["APPROVED", "FUNDED", "REJECTED"]},
        },
        _count: {_all: true},
      }),
      prisma.dealerDailyMetric.findMany({
        where: dealerFilter,
        distinct: ["dealerId"],
        orderBy: [{dealerId: "asc"}, {date: "desc"}],
      }),
    ]);

  const metrics = new Map<string, DealerMetricSummary>();

  for (const dealerId of dealerIds || []) {
    metrics.set(dealerId, createEmptyMetric(dealerId));
  }

  for (const row of vehiclesByDealer) {
    const current = metrics.get(row.dealerId) || createEmptyMetric(row.dealerId);
    current.vehicleCount = row._count._all;
    metrics.set(row.dealerId, current);
  }

  for (const row of applicationsByDealer) {
    const current = metrics.get(row.dealerId) || createEmptyMetric(row.dealerId);
    current.applicationsTotal = row._count._all;
    metrics.set(row.dealerId, current);
  }

  for (const row of financingByDealer) {
    const current = metrics.get(row.dealerId) || createEmptyMetric(row.dealerId);
    if (APPROVED_FINANCING_STATUSES.has(row.financingStatus)) {
      current.applicationsApproved += row._count._all;
    }
    if (row.financingStatus === REJECTED_FINANCING_STATUS) {
      current.applicationsRejected += row._count._all;
    }
    metrics.set(row.dealerId, current);
  }

  for (const row of latestSnapshots) {
    const current = metrics.get(row.dealerId) || createEmptyMetric(row.dealerId);
    current.latestSnapshotDate = row.date;
    metrics.set(row.dealerId, current);
  }

  return metrics;
}

export async function getDealerMetricSummary(dealerId: string) {
  const metrics = await getDealerMetricsMap([dealerId]);
  return metrics.get(dealerId) || createEmptyMetric(dealerId);
}

export async function getDealerDailySnapshots(dealerId: string, limit = 14) {
  return prisma.dealerDailyMetric.findMany({
    where: {dealerId},
    orderBy: {date: "desc"},
    take: limit,
  });
}

export async function refreshDealerDailyMetrics(snapshotDate = new Date()) {
  const normalizedDate = normalizeSnapshotDate(snapshotDate);
  const dealers = await prisma.dealer.findMany({
    where: {status: "ACTIVE"},
    select: {id: true},
  });

  if (!dealers.length) {
    return {snapshotDate: normalizedDate, processed: 0};
  }

  const dealerIds = dealers.map((dealer) => dealer.id);
  const metrics = await getDealerMetricsMap(dealerIds);

  await prisma.$transaction(
    dealerIds.map((dealerId) =>
      prisma.dealerDailyMetric.upsert({
        where: {
          dealerId_date: {
            dealerId,
            date: normalizedDate,
          },
        },
        update: {
          vehicleCount: metrics.get(dealerId)?.vehicleCount || 0,
          applicationsTotal: metrics.get(dealerId)?.applicationsTotal || 0,
          applicationsApproved: metrics.get(dealerId)?.applicationsApproved || 0,
          applicationsRejected: metrics.get(dealerId)?.applicationsRejected || 0,
        },
        create: {
          dealerId,
          date: normalizedDate,
          vehicleCount: metrics.get(dealerId)?.vehicleCount || 0,
          applicationsTotal: metrics.get(dealerId)?.applicationsTotal || 0,
          applicationsApproved: metrics.get(dealerId)?.applicationsApproved || 0,
          applicationsRejected: metrics.get(dealerId)?.applicationsRejected || 0,
        },
      })
    )
  );

  return {snapshotDate: normalizedDate, processed: dealerIds.length};
}
