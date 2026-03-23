import {NextRequest, NextResponse} from "next/server";

import {prisma} from "@/lib/prisma";

const ROOT_DOMAIN = (process.env.PLATFORM_ROOT_DOMAIN || "yaskrava.eu").toLowerCase();

/**
 * Caddy on_demand_tls ask endpoint.
 * Caddy calls GET /api/internal/ask?domain=<hostname> before provisioning
 * a TLS certificate on-demand. We return 200 OK only for valid dealer subdomains.
 *
 * Security: only allow *.yaskrava.eu subdomains that map to an active dealer.
 */
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain")?.toLowerCase().trim();

  if (!domain) {
    return new NextResponse("missing domain", {status: 400});
  }

  // Always allow the root domain and www
  if (domain === ROOT_DOMAIN || domain === `www.${ROOT_DOMAIN}`) {
    return new NextResponse("ok", {status: 200});
  }

  // Must be a subdomain of our root domain
  if (!domain.endsWith(`.${ROOT_DOMAIN}`)) {
    return new NextResponse("not allowed", {status: 403});
  }

  const slug = domain.slice(0, -(ROOT_DOMAIN.length + 1));

  // Reject www as dealer slug
  if (slug === "www") {
    return new NextResponse("ok", {status: 200});
  }

  try {
    const dealer = await prisma.dealer.findFirst({
      where: {slug, status: "ACTIVE", deletedAt: null},
      select: {id: true},
    });

    if (dealer) {
      return new NextResponse("ok", {status: 200});
    }

    return new NextResponse("no active dealer for this subdomain", {status: 403});
  } catch {
    // On DB error, allow provisioning to avoid blocking legitimate traffic
    return new NextResponse("ok", {status: 200});
  }
}
