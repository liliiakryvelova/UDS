import Link from "next/link";
import type { EventItem } from "@/lib/domain/types";

function formatEventDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" }).format(new Date(date));
}

function eventTypeLabel(eventType: EventItem["eventType"]) {
  return eventType.charAt(0).toUpperCase() + eventType.slice(1);
}

export default function PublicEventCard({
  event,
  href,
}: {
  event: EventItem;
  href: string;
}) {
  return (
    <article className="public-event-card group w-full max-w-[22rem] self-stretch">
      <div className="public-event-card__art">
        <span className="public-event-card__circle public-event-card__circle--one" aria-hidden="true" />
        <span className="public-event-card__circle public-event-card__circle--two" aria-hidden="true" />
        <span className="public-event-card__circle public-event-card__circle--three" aria-hidden="true" />
        <span className="public-event-card__type">{eventTypeLabel(event.eventType)}</span>
        <Link className="public-event-card__arrow" href={href} aria-label={`See details for ${event.name}`}>
          ↗
        </Link>
        <div className="public-event-card__date" aria-label={formatEventDate(event.startDate, { month: "long", day: "numeric" })}>
          <span>{formatEventDate(event.startDate, { day: "numeric" })}</span>
          <span>{formatEventDate(event.startDate, { month: "short" })}</span>
        </div>
      </div>

      <div className="public-event-card__body">
        <p className="public-event-card__meta">
          {formatEventDate(event.startDate, { month: "short", day: "numeric", year: "numeric" })}
          {event.endDate !== event.startDate ? ` – ${formatEventDate(event.endDate, { month: "short", day: "numeric", year: "numeric" })}` : ""}
          <span aria-hidden="true"> · </span>
          {event.venueName}
        </p>
        <h3 className="public-event-card__title">{event.name}</h3>
        <p className="public-event-card__description">{event.shortDescription}</p>
        <Link className="public-event-card__details" href={href}>
          See the details <span aria-hidden="true">⟶</span>
        </Link>
      </div>
    </article>
  );
}