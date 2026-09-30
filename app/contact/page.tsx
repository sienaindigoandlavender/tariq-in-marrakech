import type { Metadata } from "next";
import Link from "next/link";
import { Identity } from "@/components/Legal";
import { formatWhatsapp, waLink } from "@/lib/config";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Tariq in Marrakech on WhatsApp, daily 8:00–22:00, for bookings, changes, cancellations, riad partnerships and anything on the day.",
  alternates: { canonical: "/contact" },
};

const wa = formatWhatsapp();

const reasons = [
  {
    h: "Book, change or cancel",
    p: "Send your booking reference and what you need. Free changes and cancellation up to 24 hours before pickup.",
    msg: "Hello Tariq, my booking reference is TRQ-",
    cta: "Message about a booking",
  },
  {
    h: "On the day of your trip",
    p: "Running late, can't find the pickup point or need something? Message us and the team replies straight away.",
    msg: "Hello Tariq, I'm on my trip today and need help: ",
    cta: "Message the team now",
  },
  {
    h: "Riads and hotels",
    p: "Offer your guests transfers, trips and services with your own QR card, and earn a commission on every booking.",
    msg: "Hello Tariq, I run a riad in Marrakech and would like to become a partner.",
    cta: "Become a partner",
  },
  {
    h: "Something else",
    p: "Group requests, suppliers, press or feedback. Tell us what it's about.",
    msg: "Hello Tariq, ",
    cta: "Send a message",
  },
];

export default function ContactPage() {
  return (
    <div className="wrap pb-10">
      <nav aria-label="Breadcrumb" className="pt-5 text-sm text-muted">
        <Link href="/">Explore</Link> › <span aria-current="page">Contact</span>
      </nav>

      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 pb-8 pt-3 phone:grid-cols-1">
        <div className="max-w-[60ch]">
          <h1 className="m-0 text-[clamp(28px,4vw,40px)] font-extrabold leading-tight">Talk to a person</h1>
          <p className="m-0 mt-3 text-[17px] text-muted">
            WhatsApp is the fastest way to reach us. A real person answers, daily from 8:00 to 22:00, Morocco time. Messages sent at night are answered first thing in
            the morning.
          </p>
        </div>
        <div className="grid gap-2 rounded-card bg-soft p-5">
          <span className="text-[13px] font-bold text-muted">WhatsApp</span>
          <span className="tnum select-all text-2xl font-extrabold">{wa}</span>
          {LEGAL.email ? (
            <>
              <span className="mt-2 text-[13px] font-bold text-muted">Email</span>
              <a href={`mailto:${LEGAL.email}`} className="select-all text-[17px] font-bold text-blue [overflow-wrap:anywhere]">
                {LEGAL.email}
              </a>
            </>
          ) : null}
        </div>
      </header>

      <section aria-label="How can we help" className="grid grid-cols-2 gap-4 phone:grid-cols-1">
        {reasons.map((r) => (
          <div key={r.h} className="flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
            <h2 className="m-0 text-lg font-extrabold">{r.h}</h2>
            <p className="m-0 flex-1 text-[15px] text-muted">{r.p}</p>
            <a
              href={waLink(r.msg)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-[46px] items-center justify-center self-start rounded-full bg-wa px-5 font-extrabold text-white no-underline"
            >
              {r.cta}
            </a>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-3 gap-6 border-t border-line pt-8 mt-10 tab:grid-cols-1">
        <div>
          <h2 className="m-0 mb-2 text-lg font-extrabold">Quick answers</h2>
          <ul className="m-0 grid list-none gap-2 p-0 text-[15px]">
            <li>
              <b>Cancel:</b> reply CANCEL to your WhatsApp confirmation, free up to 24 h before pickup.
            </li>
            <li>
              <b>Pay:</b> on the day, in cash (MAD or EUR) or by card where available.
            </li>
            <li>
              <b>Pickup:</b> at the nearest car access point to your riad. We tell you where.
            </li>
          </ul>
        </div>
        <div>
          <h2 className="m-0 mb-2 text-lg font-extrabold">Before you message</h2>
          <p className="m-0 text-[15px] text-muted">
            Most questions are answered in our <Link href="/faq">FAQ</Link> or instantly by <Link href="/concierge">Ask Tariq</Link>, and your bookings are all in{" "}
            <Link href="/trip">My trip</Link> on this device.
          </p>
        </div>
        <div>
          <h2 className="m-0 mb-2 text-lg font-extrabold">The company</h2>
          {LEGAL.name || LEGAL.address ? (
            <Identity />
          ) : (
            <p className="m-0 text-[15px] text-muted">Tariq is based in Marrakech. Licensed tourist transport with our own vans and drivers.</p>
          )}
          <p className="m-0 mt-3 text-sm text-muted">
            <Link href="/booking-conditions">Booking conditions</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
