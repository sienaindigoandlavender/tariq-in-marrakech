import type { Metadata } from "next";
import Link from "next/link";
import { Identity, LegalPage, type LegalSection } from "@/components/Legal";
import { formatWhatsapp } from "@/lib/config";
import { LEGAL, legalName } from "@/lib/legal";
import { paypalEnabled } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal data Tariq collects when you book trips and transfers in Marrakech, why, who sees it, how long we keep it and your rights under Law 09-08.",
  alternates: { canonical: "/privacy" },
};

const wa = formatWhatsapp();
const contact = LEGAL.email ? (
  <>
    by email to <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> or on WhatsApp at {wa}
  </>
) : (
  <>on WhatsApp at {wa}</>
);

function buildSections(payNow: boolean): LegalSection[] {
  return [
  {
    id: "controller",
    h: "Who is responsible",
    body: (
      <>
        <p>
          <strong>{legalName()}</strong> is responsible for the personal data collected on this site and when you book with us. We process it in line with
          Moroccan Law 09-08 on the protection of individuals with regard to the processing of personal data
          {LEGAL.cndp ? <> (CNDP reference {LEGAL.cndp})</> : null}, and we respect the equivalent rights of visitors from the European Union.
        </p>
        <Identity />
      </>
    ),
  },
  {
    id: "what",
    h: "What we collect",
    body: (
      <>
        <h3>When you book</h3>
        <ul>
          <li>the lead guest&rsquo;s name and WhatsApp number</li>
          <li>the date, number of guests, product, options and extras you choose</li>
          <li>the name of your riad or hotel, used as the pickup place</li>
          <li>anything you write in the notes, such as a flight number, a restaurant name, allergies or a baby&rsquo;s age</li>
          <li>the booking reference, price and status (for example, picked up or paid)</li>
          {payNow ? <li>if you pay online: the payment method (PayPal), the PayPal order and transaction references, and the amount paid or refunded</li> : null}
        </ul>
        <h3>When you ask us to plan a trip</h3>
        <p>
          Your travel dates, the number of adults and children, the kind of trip, what you need, your budget range, your name, WhatsApp number, email if you
          give it, and anything you write in the notes.
        </p>
        <h3 id="accounts">When you create an account</h3>
        <p>
          Your email address, used only to send you sign-in links, and the list of products you saved to your wishlist. An account is optional: you can book
          without one.
        </p>
        <h3>When you ask Tariq, our concierge</h3>
        <p>The text of your questions and the products suggested in reply.</p>
        <h3>When you arrive through a riad&rsquo;s QR card</h3>
        <p>The code of that riad, so we can pay it its commission.</p>
        <h3>Technical data</h3>
        <p>
          Your IP address, used briefly to prevent abuse of the booking and concierge features, and standard server logs kept by our hosting provider.
        </p>
        <p>
          {payNow ? "We never see or store your card number: online payments are handled by PayPal. " : "We do not ask for payment card details. "}We don&rsquo;t ask
          for passport numbers, and we don&rsquo;t need an email address or an account to book. Please don&rsquo;t put sensitive information in the notes or
          the concierge chat beyond what we need to deliver your booking safely.
        </p>
      </>
    ),
  },
  {
    id: "why",
    h: "Why we use it",
    body: (
      <ul>
        <li>
          <strong>To deliver your booking</strong>: plan pickups, brief drivers and suppliers, send your pickup time on WhatsApp and collect payment. This is
          necessary to perform the contract you enter into when you book.
        </li>
        <li>
          <strong>To keep you safe</strong>: allergies, health notes and children&rsquo;s ages are used only to prepare your service. You provide them with your
          consent, and you can ask us to delete them at any time.
        </li>
        <li>
          <strong>To answer your questions and trip requests</strong> in the concierge chat, on WhatsApp and by email if you gave one.
        </li>
        <li>
          <strong>To run and improve the service</strong>: accounting, preventing fraud and abuse, paying riad partners, and reading which questions come up
          most so we can offer what travellers need. This is our legitimate interest.
        </li>
        <li>
          <strong>To meet legal obligations</strong>, such as keeping accounting records.
        </li>
      </ul>
    ),
  },
  {
    id: "sharing",
    h: "Who sees it",
    body: (
      <>
        <p>We never sell your data and we don&rsquo;t use it for advertising. We share it only with:</p>
        <ul>
          <li>
            <strong>Your driver and the supplier delivering your service</strong> (for example the balloon operator, desert camp, therapist or henna artist):
            only the name, phone number, pickup place, guest count and relevant notes.
          </li>
          <li>
            <strong>The riad partner</strong> whose QR card you used: the booking reference, date and amount, so it can be paid its commission. Not your
            phone number or notes.
          </li>
          <li>
            <strong>Service providers that host and run the site</strong>, under contract and only on our instructions: Vercel (website hosting), Supabase
            (database) and Anthropic (the AI model that answers concierge questions). WhatsApp (Meta) handles the messages you exchange with us there.
          </li>
          {payNow ? (
            <li>
              <strong>PayPal</strong>, if you choose to pay online: it receives the amount and booking reference and processes your payment under its own
              privacy policy. Your card details go directly to PayPal, never to us.
            </li>
          ) : null}
          <li>
            <strong>Authorities</strong>, when the law requires it.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "transfers",
    h: "Data stored outside Morocco",
    body: (
      <p>
        Our hosting, database and AI providers store or process data on servers in the European Union and the United States. We use providers that offer
        strong contractual and security safeguards, and we transfer only what is needed to run the service.
      </p>
    ),
  },
  {
    id: "retention",
    h: "How long we keep it",
    body: (
      <ul>
        <li>Booking records, including amounts paid: for the period required by Moroccan accounting and tax law, then deleted.</li>
        <li>Booking notes, which can contain allergy or health information: cleared 90 days after the date of your service.</li>
        <li>Concierge questions: stored without being linked to your name, number or booking, and deleted after 24 months.</li>
        <li>Trip requests that don&rsquo;t become a booking: deleted after 12 months.</li>
        <li>Accounts and wishlists: until you ask us to delete your account. Deleting it removes your email and wishlist.</li>
        <li>Technical logs: kept by our hosting provider for a short period, usually under 30 days.</li>
      </ul>
    ),
  },
  {
    id: "device",
    h: "Cookies and storage on your device",
    body: (
      <>
        <p>We use no advertising or tracking cookies. The site stores a few small items on your device so it works as you expect:</p>
        <ul>
          <li>
            <strong>My trip, saved items and your last booking details</strong> (browser storage), so you can see your bookings and book the next one
            faster. They stay on your device and you can clear them in your browser settings.
          </li>
          <li>
            <strong>Your chosen date, guests and currency</strong>, so prices show the right total.
          </li>
          <li>
            <strong>The riad partner code</strong> (a cookie for 30 days), if you arrived by scanning a riad&rsquo;s QR card.
          </li>
          <li>
            <strong>A sign-in cookie</strong>, only if you sign in to your account (or, for our team, the dispatch board).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "rights",
    h: "Your rights",
    body: (
      <>
        <p>
          You can ask to access the data we hold about you, correct it, delete it, or object to its use. Contact us {contact} with your booking reference. We
          reply within 30 days. We may need to keep booking and payment records that the law requires us to keep.
        </p>
        <p>
          If you are not satisfied with our answer, you can contact the Moroccan data protection authority, the CNDP (Commission Nationale de contrôle de la
          protection des Données à caractère Personnel), or the data protection authority in your own country.
        </p>
      </>
    ),
  },
  {
    id: "security",
    h: "Security",
    body: (
      <p>
        Booking data sits in a database that cannot be read from the public website. Only our team, signed in, can see bookings, and drivers and suppliers
        receive only what they need for your service. Connections to the site are encrypted.
      </p>
    ),
  },
  {
    id: "children",
    h: "Children",
    body: (
      <p>
        Bookings must be made by an adult. We only hold information about children that a parent or guardian gives us to prepare a service, such as a
        baby&rsquo;s age for a car seat.
      </p>
    ),
  },
  {
    id: "changes",
    h: "Changes to this policy",
    body: (
      <p>
        We update this policy when our service or the law changes. The date at the top shows the latest version. See also our{" "}
        <Link href="/booking-conditions">Booking conditions</Link> and <Link href="/terms">Terms of use</Link>.
      </p>
    ),
  },
  ];
}

export default function PrivacyPage() {
  const payNow = paypalEnabled() && supabaseAdmin() !== null;
  return (
    <LegalPage
      title="Privacy policy"
      intro={
        <p>
          We collect what we need to pick you up, deliver your booking and answer your questions, and nothing more. We don&rsquo;t sell data and we don&rsquo;t
          track you for advertising.
        </p>
      }
      sections={buildSections(payNow)}
    />
  );
}
