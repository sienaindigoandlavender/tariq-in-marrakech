import type { Metadata } from "next";
import Link from "next/link";
import { Identity, LegalPage, type LegalSection } from "@/components/Legal";
import { legalName } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using the Tariq website and Ask Tariq concierge: information accuracy, AI answers, illustrations, intellectual property and acceptable use.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "about",
    h: "About these terms",
    body: (
      <>
        <p>
          These terms cover your use of this website, including Ask Tariq, our concierge. The site is run by <strong>{legalName()}</strong>. Bookings are
          covered by our <Link href="/booking-conditions">Booking conditions</Link>, and personal data by our <Link href="/privacy">Privacy policy</Link>.
          By using the site, you accept these terms.
        </p>
        <Identity />
      </>
    ),
  },
  {
    id: "information",
    h: "Information on the site",
    body: (
      <>
        <p>
          We keep product information accurate and up to date: what is included, timings, distances and prices. Timings and distances are approximate and
          depend on traffic, weather and the group. Your booking confirmation and the WhatsApp message the evening before are the reference for your
          booking.
        </p>
        <p>
          General information, such as travel tips and descriptions of places, is given in good faith for guidance. It is not professional, medical, legal
          or safety advice.
        </p>
      </>
    ),
  },
  {
    id: "concierge",
    h: "Ask Tariq, our AI concierge",
    body: (
      <>
        <p>
          Ask Tariq uses an AI model to answer questions and suggest products from our catalogue. It can make mistakes. Its answers are suggestions, not a
          booking and not a promise. Prices, availability and what is included are those shown on the product page and in your confirmation.
        </p>
        <p>
          Please don&rsquo;t share passwords, card details or sensitive personal information in the chat. For anything urgent on the day of a service,
          message our team on WhatsApp, where a person answers.
        </p>
      </>
    ),
  },
  {
    id: "illustrations",
    h: "Illustrations and photos",
    body: (
      <p>
        The painted scenes on this site are illustrations, not photos of the exact vehicle, camp, room or place you will visit. Where we show photos, they
        are of our own services. Product pages describe what is actually included.
      </p>
    ),
  },
  {
    id: "use",
    h: "Using the site fairly",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>make bookings you don&rsquo;t intend to keep, or bookings in someone else&rsquo;s name without their permission</li>
          <li>send automated requests, scrape the catalogue or prices, or overload the booking or concierge features</li>
          <li>try to access the dispatch board, database or accounts you are not authorised to use</li>
          <li>use the concierge to produce content that is unlawful, abusive or unrelated to your trip</li>
        </ul>
        <p>We may block access or cancel bookings made in breach of these terms.</p>
      </>
    ),
  },
  {
    id: "ip",
    h: "Intellectual property",
    body: (
      <p>
        The site&rsquo;s design, illustrations, text, name and logo belong to {legalName()} or are used with permission. You may view and share links to our
        pages for personal use. Copying, republishing or reusing our content, illustrations or catalogue for commercial purposes needs our written
        permission.
      </p>
    ),
  },
  {
    id: "links",
    h: "Links to other sites",
    body: (
      <p>
        Links to other websites and apps, such as WhatsApp, are provided for convenience. We are not responsible for their content or how they handle your
        data.
      </p>
    ),
  },
  {
    id: "availability",
    h: "Availability of the site",
    body: (
      <p>
        We aim to keep the site available at all times, but we can&rsquo;t guarantee it will be free of interruptions or errors. If the site is down, you can
        always book or change a booking on WhatsApp.
      </p>
    ),
  },
  {
    id: "liability",
    h: "Liability",
    body: (
      <p>
        We are not liable for indirect loss arising from use of the website. Our responsibilities for the services you book are set out in the{" "}
        <Link href="/booking-conditions">Booking conditions</Link>. Nothing in these terms limits rights you have under Moroccan consumer law that cannot be
        excluded.
      </p>
    ),
  },
  {
    id: "law",
    h: "Changes and governing law",
    body: (
      <p>
        We may update these terms; the date at the top shows the latest version. These terms are governed by Moroccan law, and the competent courts of
        Marrakech have jurisdiction, without affecting mandatory consumer rights in your own country.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro={
        <p>
          The rules for using this website and Ask Tariq. For how bookings, payment, cancellation and refunds work, see the{" "}
          <Link href="/booking-conditions">Booking conditions</Link>.
        </p>
      }
      sections={sections}
    />
  );
}

