import {NextResponse} from "next/server";
import {headers} from "next/headers";

import {APP_STORE_URL, PLAY_STORE_URL} from "@/lib/appLinks";

export async function GET() {
  const userAgent = (await headers()).get("user-agent") || "";
  const isAndroid = /Android/i.test(userAgent);

  return NextResponse.redirect(isAndroid ? PLAY_STORE_URL : APP_STORE_URL, 307);
}
