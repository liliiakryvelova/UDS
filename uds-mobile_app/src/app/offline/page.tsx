import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <span className="offline-mark" aria-hidden="true">✳</span>
      <p className="section-kicker">A LITTLE PAUSE</p>
      <h1>You’re offline right now.</h1>
      <p>Reconnect to browse the latest events and manage your volunteer plans.</p>
      <Link className="primary-button" href="/">Try again <span>→</span></Link>
    </main>
  );
}
