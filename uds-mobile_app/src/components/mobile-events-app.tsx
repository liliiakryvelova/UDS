"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  communityId: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  bannerImageUrl?: string;
  eventType: string;
  status: string;
  startDate: string;
  endDate: string;
  timezone: string;
  registrationDeadline: string;
  venueName: string;
  fullAddress: string;
  captainName?: string;
  supplies: string[];
};

type Slot = {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  roleName: string;
  peopleNeeded: number;
  meetingPoint?: string;
  instructions?: string;
};

type SavedPass = { token: string; eventName: string; eventDate: string };
type Registration = {
  id: string;
  registrationId?: string;
  eventId: string;
  slotId: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  status: string;
};
type Tab = "Explore" | "My passes" | "Admin";

const API = "/api/uds";
const UDS_WEB_URL = process.env.NEXT_PUBLIC_UDS_WEB_URL || "https://events.ukrainedefensesupport.org";
const UDS_LOGO_URL = `${UDS_WEB_URL.replace(/\/+$/, "")}/Logo_header.svg`;
const EVENT_TYPES = ["All", "Volunteer", "Workshop", "Festival", "Practice", "Tournament"];

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}/${path}`, { ...init, cache: "no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result as T;
}

function formatDate(value: string) {
  if (!value) return "Date to be announced";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(parsed);
}

function getLocalPasses(): SavedPass[] {
  try {
    return JSON.parse(localStorage.getItem("uds-mobile-passes") || "[]") as SavedPass[];
  } catch {
    return [];
  }
}

export default function MobileEventsApp() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("Explore");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [passes, setPasses] = useState<SavedPass[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, Registration>>({});
  const [editingPass, setEditingPass] = useState<string | null>(null);
  const [adminEvents, setAdminEvents] = useState<EventItem[]>([]);
  const [adminRegistrations, setAdminRegistrations] = useState<Record<string, Registration[]>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [deferredInstall, setDeferredInstall] = useState<Event | null>(null);

  useEffect(() => {
    void api<{ items: EventItem[] }>("communities/uds/events")
      .then((result) => setEvents(result.items || []))
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load events."))
      .finally(() => setBusy(false));
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const onInstall = (event: Event) => {
      event.preventDefault();
      setDeferredInstall(event);
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  const filteredEvents = useMemo(() => events.filter((event) => {
    const searchable = `${event.name} ${event.shortDescription} ${event.venueName} ${event.eventType}`.toLowerCase();
    return searchable.includes(search.toLowerCase()) && (filter === "All" || event.eventType.toLowerCase() === filter.toLowerCase());
  }), [events, filter, search]);

  async function openEvent(event: EventItem) {
    setSelectedEvent(event);
    setNotice("");
    setError("");
    try {
      const result = await api<{ items: Slot[] }>(`events/${encodeURIComponent(event.id)}/slots`);
      setSlots(result.items || []);
    } catch (caught) {
      setSlots([]);
      setError(caught instanceof Error ? caught.message : "Could not load shifts.");
    }
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvent) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ registration: Registration; manageUrl: string }>(`events/${encodeURIComponent(selectedEvent.id)}/registrations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slotId: form.get("slotId"),
          fullName: form.get("fullName"),
          email: form.get("email"),
          phone: form.get("phone"),
          notes: form.get("notes"),
          consentWaiverAccepted: form.get("consent") === "on",
        }),
      });
      const token = result.manageUrl.split("/").filter(Boolean).at(-1);
      if (token) {
        const nextPasses = [{ token, eventName: selectedEvent.name, eventDate: selectedEvent.startDate }, ...passes.filter((pass) => pass.token !== token)];
        localStorage.setItem("uds-mobile-passes", JSON.stringify(nextPasses));
        setPasses(nextPasses);
        setRegistrations((current) => ({ ...current, [token]: result.registration }));
      }
      setNotice("You’re on the list. Your confirmation and manage link are saved on this device.");
      setActiveTab("My passes");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function loadPassData(saved = passes) {
    const loaded: Record<string, Registration> = {};
    await Promise.all(saved.map(async (pass) => {
      try {
        loaded[pass.token] = await api<Registration>(`registrations/manage/${encodeURIComponent(pass.token)}`);
      } catch {
        // Keep the saved item so a temporary connection issue doesn't erase the manage link.
      }
    }));
    setRegistrations(loaded);
  }

  async function cancelPass(token: string) {
    if (!window.confirm("Cancel this registration?")) return;
    setBusy(true);
    try {
      await api(`registrations/manage/${encodeURIComponent(token)}`, { method: "DELETE" });
      setNotice("Registration cancelled.");
      await loadPassData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not cancel registration.");
    } finally {
      setBusy(false);
    }
  }

  async function updatePass(event: FormEvent<HTMLFormElement>, token: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await api(`registrations/manage/${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName: form.get("fullName"), email: form.get("email"), phone: form.get("phone"), notes: form.get("notes") }),
      });
      setEditingPass(null);
      setNotice("Your registration details were updated.");
      await loadPassData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update registration.");
    } finally {
      setBusy(false);
    }
  }

  async function loadAdminEvents() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ items: EventItem[] }>("admin/events");
      setAdminEvents(result.items || []);
      setIsAdmin(true);
      return true;
    } catch (caught) {
      setIsAdmin(false);
      if (caught instanceof Error && caught.message !== "Unauthorized") setError(caught.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function adminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("admin/login", { method: "POST", body: form });
      if (!(await loadAdminEvents())) throw new Error("Could not sign in. Check your admin email and password.");
      setNotice("Signed in to event management.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign-in failed. Check your details.");
    } finally {
      setBusy(false);
    }
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const startDate = String(form.get("startDate"));
    setBusy(true);
    setError("");
    try {
      await api("admin/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          communityId: form.get("communityId"), name: form.get("name"), eventType: "volunteer", status: "draft",
          startDate, endDate: String(form.get("endDate") || startDate),
          registrationDeadline: String(form.get("registrationDeadline")), timezone: "America/Los_Angeles",
          place: form.get("place"), shortDescription: form.get("shortDescription"),
          fullDescription: form.get("shortDescription"), supplies: [], slotStartTime: "09:00", slotEndTime: "12:00", peopleNeeded: 5,
        }),
      });
      setNotice("Draft event created.");
      await loadAdminEvents();
      formElement.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the event.");
    } finally {
      setBusy(false);
    }
  }

  async function cancelAdminEvent(eventId: string) {
    if (!window.confirm("Cancel this event? This will update its status for everyone.")) return;
    setBusy(true);
    try {
      await api(`admin/events/${encodeURIComponent(eventId)}/cancel`, { method: "POST" });
      setNotice("Event cancelled.");
      await loadAdminEvents();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not cancel the event.");
    } finally {
      setBusy(false);
    }
  }

  async function loadAdminRegistrations(eventId: string) {
    if (adminRegistrations[eventId]) {
      setAdminRegistrations((current) => ({ ...current, [eventId]: [] }));
      return;
    }
    try {
      const result = await api<{ items: Registration[] }>(`admin/events/${encodeURIComponent(eventId)}/registrations`);
      setAdminRegistrations((current) => ({ ...current, [eventId]: result.items || [] }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load registrations.");
    }
  }

  async function removeAdminRegistration(registrationId: string, eventId: string) {
    if (!window.confirm("Remove this volunteer registration?")) return;
    try {
      await api(`admin/registrations/${encodeURIComponent(registrationId)}`, { method: "DELETE" });
      setAdminRegistrations((current) => ({ ...current, [eventId]: (current[eventId] || []).filter((item) => (item.registrationId || item.id) !== registrationId) }));
      setNotice("Registration removed.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove registration.");
    }
  }

  async function sendAdminReminder(registrationId: string) {
    try {
      await api(`admin/registrations/${encodeURIComponent(registrationId)}/reminder`, { method: "POST" });
      setNotice("Reminder sent.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send reminder.");
    }
  }

  async function installApp() {
    const promptEvent = deferredInstall as (Event & { prompt?: () => Promise<void>; userChoice?: Promise<{ outcome: string }> }) | null;
    if (promptEvent?.prompt) {
      await promptEvent.prompt();
      setDeferredInstall(null);
    } else {
      setShowInstallHelp(true);
    }
  }

  function changeTab(tab: Tab) {
    setActiveTab(tab);
    setSelectedEvent(null);
    setNotice("");
    setError("");
    if (tab === "My passes") {
      const savedPasses = getLocalPasses();
      setPasses(savedPasses);
      void loadPassData(savedPasses);
    }
    if (tab === "Admin") void loadAdminEvents();
  }

  return (
    <main className="app-frame">
      <header className="topbar">
        <button className="brand" onClick={() => changeTab("Explore")} aria-label="Ukraine Defense Support Events home">
          <img className="brand-mark" src={UDS_LOGO_URL} alt="" width={38} height={38} />
          <span><strong>Ukraine Defense Support Events</strong></span>
        </button>
        <button className="install-button" onClick={() => void installApp()}><span aria-hidden="true">＋</span> Install app</button>
      </header>

      <div className="page-content">
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
        {error && <div className="error-banner" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss">×</button></div>}

        {selectedEvent ? (
          <section className="detail-screen">
            <button className="back-button" onClick={() => setSelectedEvent(null)}>← <span>All events</span></button>
            <div className="detail-hero">
              <span className="eyebrow">{selectedEvent.eventType} · UDS community</span>
              <h1>{selectedEvent.name}</h1>
              <p>{selectedEvent.shortDescription}</p>
              <div className="detail-date"><span className="date-icon">▦</span><span><strong>{formatDate(selectedEvent.startDate)}</strong><small>{selectedEvent.venueName}</small></span></div>
            </div>
            <div className="detail-columns">
              <div className="detail-copy">
                <p className="section-kicker">ABOUT THIS EVENT</p>
                <p className="body-copy">{selectedEvent.fullDescription || selectedEvent.shortDescription}</p>
                {selectedEvent.supplies?.length > 0 && <div className="info-panel"><strong>Bring along</strong><p>{selectedEvent.supplies.join(" · ")}</p></div>}
                {selectedEvent.captainName && <div className="info-panel"><strong>Event contact</strong><p>{selectedEvent.captainName}</p></div>}
              </div>
              <form className="signup-card" onSubmit={submitRegistration}>
                <p className="section-kicker">YOUR NEXT GOOD THING</p>
                <h2>Join the team</h2>
                <label>Choose a volunteer shift<select required name="slotId" defaultValue=""><option value="" disabled>Select a shift</option>{slots.map((slot) => <option value={slot.id} key={slot.id}>{formatDate(slot.slotDate)} · {slot.startTime}–{slot.endTime} · {slot.roleName}</option>)}</select></label>
                {slots.length === 0 && <p className="muted">No open shifts are listed right now.</p>}
                <label>Your name<input required name="fullName" autoComplete="name" placeholder="Full name" /></label>
                <label>Email address<input required name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
                <label>Phone number<input required name="phone" type="tel" autoComplete="tel" placeholder="Your phone number" /></label>
                <label>Note for the team <span className="optional">Optional</span><textarea name="notes" rows={2} placeholder="Anything the team should know?" /></label>
                <label className="consent"><input name="consent" type="checkbox" required /><span>I agree to the volunteer participation waiver.</span></label>
                <button className="primary-button" disabled={busy || slots.length === 0}>{busy ? "Saving…" : "Save my spot"}<span aria-hidden="true">→</span></button>
                <p className="fine-print">A secure manage link will be saved in My passes on this device and sent to your email.</p>
              </form>
            </div>
          </section>
        ) : activeTab === "Explore" ? (
          <>
            <section className="welcome-panel">
              <div className="welcome-art" aria-hidden="true"><span className="sun-orb"/><span className="art-line art-line-one"/><span className="art-line art-line-two"/><span className="art-star">✳</span></div>
              <p className="section-kicker">GOOD PEOPLE. REAL IMPACT.</p>
              <h1>Show up for<br /><em>something good.</em></h1>
              <p className="welcome-copy">Find your people, lend a hand, and make a difference together.</p>
              <div className="impact-chip"><span className="impact-dot"/> Local events · Open to everyone</div>
            </section>
            <section className="events-section">
              <div className="section-heading"><div><p className="section-kicker">FIND YOUR NEXT YES</p><h2>Coming up</h2></div><span className="event-count">{filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}</span></div>
              <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events, places, causes" aria-label="Search events" />{search && <button onClick={() => setSearch("")} aria-label="Clear search">×</button>}</label>
              <div className="filter-row" role="group" aria-label="Filter by event type">{EVENT_TYPES.map((type) => <button key={type} className={filter === type ? "filter-chip selected" : "filter-chip"} onClick={() => setFilter(type)}>{type}</button>)}</div>
              {busy && events.length === 0 ? <div className="loading-card"><span className="spinner"/> Finding good things nearby…</div> : filteredEvents.length === 0 ? <div className="empty-card"><span className="empty-spark">✳</span><h3>{search ? "No matches this time" : "The next good thing is on its way."}</h3><p>{search ? "Try another search or browse all event types." : "Check back soon for upcoming UDS volunteer opportunities."}</p>{search && <button className="text-button" onClick={() => { setSearch(""); setFilter("All"); }}>Show all events</button>}</div> : <div className="event-list">{filteredEvents.map((event, index) => <article className="event-card" key={event.id}>
                <button className={`event-art event-art-${index % 4}`} onClick={() => void openEvent(event)} aria-label={`Open ${event.name}`}>
                  <span className="event-art-top"><span className="event-type-tag">{event.eventType}</span><span className="art-arrow">↗</span></span>
                  <span className="event-date-block"><strong>{new Date(event.startDate).getUTCDate()}</strong><small>{new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(event.startDate))}</small></span>
                  <span className="decorative-shape shape-a"/><span className="decorative-shape shape-b"/><span className="decorative-shape shape-c"/>
                </button>
                <button className="event-card-copy" onClick={() => void openEvent(event)}>
                  <span className="event-meta">{formatDate(event.startDate)} <span>·</span> {event.venueName}</span>
                  <strong>{event.name}</strong>
                  <span className="event-description">{event.shortDescription}</span>
                  <span className="event-link">See the details <span aria-hidden="true">→</span></span>
                </button>
              </article>)}</div>}
              <p className="powered-note"><span>✳</span> Small acts add up. Thanks for being here.</p>
            </section>
          </>
        ) : activeTab === "My passes" ? (
          <section className="subpage"><button className="back-button" onClick={() => changeTab("Explore")}>← <span>Explore events</span></button><p className="section-kicker">YOUR VOLUNTEER PLANS</p><h1>My passes</h1><p className="subpage-intro">Your registration manage links are saved privately on this device.</p>
            {passes.length === 0 ? <div className="empty-card"><span className="empty-spark">✳</span><h3>Your next chapter starts here.</h3><p>When you sign up for a shift, its manage link will show up here.</p><button className="primary-button compact" onClick={() => changeTab("Explore")}>Explore events <span>→</span></button></div> : <div className="pass-list">{passes.map((pass) => {
              const registration = registrations[pass.token];
              return <article className="pass-card" key={pass.token}>
                <div className="pass-accent"><span>UDS VOLUNTEER PASS</span><strong>✳</strong></div>
                <div className="pass-content"><p className="event-meta">{formatDate(pass.eventDate)}</p><h2>{pass.eventName}</h2>
                  {registration ? <><p className="pass-status"><span className={`status-dot ${registration.status === "cancelled" ? "cancelled" : ""}`}/>{registration.status}</p>{editingPass === pass.token ? <form className="edit-pass-form" onSubmit={(event) => void updatePass(event, pass.token)}><label>Name<input name="fullName" defaultValue={registration.fullName} required /></label><label>Email<input name="email" type="email" defaultValue={registration.email} required /></label><label>Phone<input name="phone" defaultValue={registration.phone} required /></label><label>Note<textarea name="notes" defaultValue={registration.notes} rows={2}/></label><div className="inline-actions"><button className="primary-button compact">Save updates</button><button type="button" className="text-button" onClick={() => setEditingPass(null)}>Keep as is</button></div></form> : <div className="pass-actions">{registration.status !== "cancelled" && <button className="secondary-button" onClick={() => setEditingPass(pass.token)}>Edit details</button>}{registration.status !== "cancelled" && <button className="text-button danger-text" onClick={() => void cancelPass(pass.token)}>Cancel spot</button>}</div>}</> : <p className="muted">Connect to the internet to load your pass details.</p>}
                </div>
              </article>;
            })}</div>}
          </section>
        ) : (
          <section className="subpage"><button className="back-button" onClick={() => changeTab("Explore")}>← <span>Explore events</span></button><p className="section-kicker">UDS TEAM TOOLS</p><h1>Event admin</h1><p className="subpage-intro">Manage the events and volunteer shifts you coordinate.</p>
            {!isAdmin ? <form className="login-card" onSubmit={(event) => void adminLogin(event)}><div className="login-icon">✳</div><h2>Admin sign in</h2><p>Use your existing UDS Events admin credentials.</p><label>Email<input type="email" name="email" autoComplete="username" required placeholder="you@organization.org" /></label><label>Password<input type="password" name="password" autoComplete="current-password" required placeholder="Your password" /></label><button className="primary-button" disabled={busy}>{busy ? "Signing in…" : "Continue to admin"}<span>→</span></button></form> : <div className="admin-dashboard">
              <div className="admin-heading"><div><span className="admin-status"><i/> Signed in</span><h2>Your events</h2></div><button className="text-button" onClick={async () => { await api("admin/logout", { method: "POST" }).catch(() => undefined); setIsAdmin(false); setAdminEvents([]); }}>Sign out</button></div>
              <form className="create-event-card" onSubmit={(event) => void createEvent(event)}><p className="section-kicker">START SOMETHING NEW</p><h3>Create a draft event</h3><p className="muted">New events start as drafts; publish from the full admin workflow after review.</p><label>Community ID<input name="communityId" required defaultValue={adminEvents[0]?.communityId || process.env.NEXT_PUBLIC_UDS_COMMUNITY_ID || ""} placeholder="Community ID" /></label><label>Event name<input name="name" required placeholder="Give your event a name" /></label><label>Short description<input name="shortDescription" required placeholder="What will volunteers do?" /></label><div className="form-grid"><label>Starts<input name="startDate" type="date" required /></label><label>Ends<input name="endDate" type="date" /></label></div><label>Registration closes<input name="registrationDeadline" type="datetime-local" required /></label><label>Location<input name="place" required placeholder="Venue or meeting point" /></label><button className="primary-button" disabled={busy}>Save draft <span>→</span></button></form>
              {adminEvents.length > 0 && <div className="admin-event-list"><h3>All events <span>{adminEvents.length}</span></h3>{adminEvents.map((event) => <div className="admin-event-wrap" key={event.id}><article className="admin-event-row"><div><strong>{event.name}</strong><span>{formatDate(event.startDate)} · {event.status.replaceAll("_", " ")}</span></div><div className="admin-row-actions"><a className="text-button" href={`${UDS_WEB_URL}/admin/events/${encodeURIComponent(event.id)}`} target="_blank" rel="noreferrer">Edit</a><button className="text-button" onClick={() => void loadAdminRegistrations(event.id)}>People</button>{event.status !== "cancelled" && <button className="text-button danger-text" onClick={() => void cancelAdminEvent(event.id)}>Cancel</button>}</div></article>
                {adminRegistrations[event.id]?.length ? <div className="admin-registration-list">{adminRegistrations[event.id].map((registration) => { const registrationId = registration.registrationId || registration.id; return <div className="admin-registration-row" key={registrationId}><span><strong>{registration.fullName}</strong><small>{registration.email} · {registration.status}</small></span><button className="text-button" onClick={() => void sendAdminReminder(registrationId)}>Remind</button><button className="text-button danger-text" onClick={() => void removeAdminRegistration(registrationId, event.id)}>Remove</button></div>; })}</div> : adminRegistrations[event.id] ? <p className="muted admin-empty">No registrations yet.</p> : null}
              </div>)}</div>}
            </div>}
          </section>
        )}
      </div>

      <nav className="bottom-nav" aria-label="Main navigation">{(["Explore", "My passes", "Admin"] as Tab[]).map((tab, index) => <button key={tab} className={activeTab === tab && !selectedEvent ? "nav-item active" : "nav-item"} onClick={() => changeTab(tab)}><span className="nav-icon" aria-hidden="true">{["⌕", "▣", "⌘"][index]}</span><span>{tab}</span></button>)}</nav>
      {showInstallHelp && <div className="modal-backdrop" role="presentation" onClick={() => setShowInstallHelp(false)}><section className="install-modal" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={() => setShowInstallHelp(false)}>×</button><span className="install-modal-icon">↥</span><p className="section-kicker">TAKE US WITH YOU</p><h2 id="install-title">Add UDS Events to your Home Screen</h2><ol><li><span>1</span>Open this page in <strong>Safari</strong> on your iPhone.</li><li><span>2</span>Tap the <strong>Share</strong> button at the bottom.</li><li><span>3</span>Choose <strong>Add to Home Screen</strong>, then tap Add.</li></ol><p className="fine-print">The app opens full-screen from its own icon. No App Store download needed.</p><button className="primary-button" onClick={() => setShowInstallHelp(false)}>Got it <span>✓</span></button></section></div>}
    </main>
  );
}
