import type { EventItem } from "@/lib/domain/types";

const DEFAULT_API_BASE = "https://events.ukrainedefensesupport.org";

type PublicEventsResponse = {
  items: EventItem[];
};

export async function getPublicUpcomingEventsByCommunitySlug(slug: string): Promise<EventItem[]> {
  const base = (process.env.UDS_API_BASE_URL || DEFAULT_API_BASE).replace(/\/+$/, "");
  const response = await fetch(`${base}/api/communities/${encodeURIComponent(slug)}/events`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Could not load public events (${response.status}).`);
  }

  const payload = (await response.json()) as PublicEventsResponse;
  if (!Array.isArray(payload.items)) {
    throw new Error("The public events service returned an invalid response.");
  }

  return payload.items;
}
