import { NextRequest } from "next/server";

const DEFAULT_API_BASE = "https://events.ukrainedefensesupport.org";

function isAllowedPath(path: string[]) {
  const value = path.join("/");
  return [
    /^communities\/[^/]+\/events$/,
    /^events\/[^/]+(?:\/slots|\/registrations)?$/,
    /^registrations\/manage\/[^/]+$/,
    /^admin\/(?:login|logout|events(?:\/[^/]+(?:\/(?:slots|cancel|close-registration|registrations(?:\/export\.csv)?|duplicate))?)?|slots\/[^/]+|registrations\/[^/]+(?:\/reminder)?)$/,
    /^user\/(?:login|signup|logout|registrations\/[^/]+\/cancel)$/,
  ].some((pattern) => pattern.test(value));
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!isAllowedPath(path)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (!["GET", "HEAD"].includes(request.method)) {
    if (process.env.NODE_ENV !== "production" && process.env.UDS_ALLOW_API_WRITES !== "true") {
      return Response.json({ error: "Live backend writes are disabled in local development. Use a staging backend or explicitly enable writes." }, { status: 403 });
    }
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }
    if (request.headers.get("sec-fetch-site") === "cross-site") {
      return Response.json({ error: "Cross-origin requests are not allowed." }, { status: 403 });
    }
  }

  const base = (process.env.UDS_API_BASE_URL || DEFAULT_API_BASE).replace(/\/+$/, "");
  const destination = new URL(`${base}/api/${path.map(encodeURIComponent).join("/")}`);
  destination.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of ["accept", "content-type", "cookie"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(destination, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return Response.json({ error: "The UDS Events service is temporarily unavailable." }, { status: 502 });
  }

  const responseHeaders = new Headers();
  for (const name of ["content-type", "cache-control", "location"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }
  responseHeaders.set("cache-control", "no-store");

  const authPath = path.join("/");
  const isAuthRedirect = upstream.status >= 300 && upstream.status < 400 &&
    ["admin/login", "admin/logout", "user/login", "user/signup", "user/logout"].includes(authPath);
  if (isAuthRedirect) {
    const redirect = upstream.headers.get("location") || "";
    responseHeaders.delete("location");
    responseHeaders.set("content-type", "application/json");
    if (new URL(redirect, base).searchParams.has("error")) {
      return new Response(JSON.stringify({ error: "Invalid email or password." }), { status: 401, headers: responseHeaders });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: responseHeaders });
  }

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
