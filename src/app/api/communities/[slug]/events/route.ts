import { getUpcomingPublishedEventsByCommunitySlug } from "@/lib/domain/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const records = await getUpcomingPublishedEventsByCommunitySlug(slug);

  return Response.json({
    items: records,
    count: records.length,
  });
}
