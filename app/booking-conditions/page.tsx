import type { Metadata } from "next";
import Link from "next/link";
import { Identity, LegalPage, type LegalSection } from "@/components/Legal";
import { formatWhatsapp } from "@/lib/config";
import { LEGAL, legalName } from "@/lib/legal";
import { paypalEnabled } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Booking Conditions",
  description: "How booking, payment on the day, cancellation, refunds and responsibilities work for Tariq trips, transfers and services in Marrakech.",
  alternates: { canonical: "/booking-conditions" },
};

const wa = formatWhatsapp();

function buildSections(payNow: boolean): LegalSection[] {
  return [
  {
    id: "who",
    h: "Who you book with",
    body: (
      <>
        <p>
          Bookings on this site are made with <strong>{legalName()}</strong> (&ldquo;Tariq&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). We run our own vans and
          drivers. Some parts of a booking are delivered by independent, licensed local suppliers we work with, such as balloon operators, desert camps,
          activity providers, therapists and henna artists. We choose them, brief them and remain your single point of contact.
        </p>
        <Identity />
      </>
    ),
  },
  {
    id: "booking",
    h: "Making a booking",
    body: (
      <>
        <p>
          A booking is confirmed when you complete checkout and see your booking reference (for example TRQ-7F3KD). The evening before, we send your exact
          pickup time and your driver&rsquo;s name on WhatsApp.
        </p>
        <p>
          Please give accurate details: the lead guest&rsquo;s name, a WhatsApp number with country code, the number of guests, and the name of your riad or
          hotel. For airport pickups, add your flight number so we can follow delays. We are not responsible for a missed or late pickup caused by wrong or
          missing details.
        </p>
        <p>
          Any booking agent, riad or hotel that passes a booking to us does so on your behalf. These conditions apply to every guest in the booking.
        </p>
      </>
    ),
  },
  {
    id: "prices",
    h: "Prices and taxes",
    body: (
      <>
        <p>
          Prices are set in euros. Prices shown in dirhams are converted at a fixed indicative rate and rounded; on the day you may pay the dirham or euro
          amount shown on your confirmation. Prices shown in US dollars or pounds sterling are a guide at an approximate rate; you always pay in euros or
          dirhams. Each product page says whether the price is per person, per car or per stay, and lists what is included and
          what is not.
        </p>
        <p>
          {LEGAL.vatIncluded
            ? "Prices include VAT (TVA) and all other taxes and fees we are required to charge."
            : "Prices include all taxes and fees we are required to charge."}{" "}
          There are no booking fees and no card surcharges. Items marked &ldquo;not included&rdquo; on the product page, such as lunches, drinks, entry
          tickets that are not listed, and tips, are paid by you directly.
        </p>
        <p>
          Prices can change before you book. The price on your confirmation is the price you pay. If we make an obvious pricing
          error, we will tell you before the service and you may cancel free of charge.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    h: payNow ? "Payment" : "Payment on the day",
    body: (
      <>
        {payNow ? (
          <p>
            At checkout you choose how to pay. <strong>Pay now</strong>: you pay the full price online through PayPal, by PayPal balance or card, and your
            booking is confirmed once the payment is approved. Nothing is due on the day. <strong>Reserve now, pay on the day</strong>: nothing is charged
            when you book, and you pay on the day as described below.
          </p>
        ) : (
          <p>Nothing is charged when you book. You pay on the day of the service, before it starts.</p>
        )}
        <p>When you pay on the day, you pay the driver, or the supplier named in your confirmation:</p>
        <ul>
          <li>in cash, in Moroccan dirhams or euros, or</li>
          <li>by card, where a card terminal is available. Ask on WhatsApp beforehand if you need to pay by card.</li>
        </ul>
        <p>
          Multi-day trips paid on the day are paid in full at pickup on day 1. Kits and rentals are paid on delivery. Services at your riad are paid when
          the professional arrives. You receive a receipt for every payment.
        </p>
        <p>
          {payNow ? "Online payments are processed by PayPal. We never see or store your card number. " : null}We never ask for card details on WhatsApp, by
          email or by phone.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    h: "Changing your booking",
    body: (
      <p>
        You can change the date, time, number of guests or pickup place free of charge up to 24 hours before pickup by messaging us on WhatsApp ({wa}),
        subject to availability. A change in the number of guests changes the price according to the product&rsquo;s pricing. Changes within 24 hours are
        possible when we can make them, but cannot be guaranteed.
      </p>
    ),
  },
  {
    id: "cancel-you",
    h: "If you cancel",
    body: (
      <>
        <p>
          Cancellation is <strong>free up to 24 hours before your pickup time</strong>. Reply CANCEL to your WhatsApp confirmation, or message us with your
          booking reference. You receive a written acknowledgement.
        </p>
        <p>
          {payNow ? (
            <>
              If you paid online and cancel in time, we refund the full amount to your original payment method. If you cancel less than 24 hours before
              pickup, or you are not at the pickup point, a prepaid booking is not refunded.{" "}
            </>
          ) : null}
          If you chose to pay on the day and cancel less than 24 hours before pickup, or you are not at the pickup point, nothing is charged, but we keep a
          record of the late cancellation or no-show and may ask for a deposit before accepting future bookings.
        </p>
        <p>
          Hot air balloon flights, desert camps and some supplier services may have their own cut-off times, which are shown on the product page and override
          this rule where stricter.
        </p>
      </>
    ),
  },
  {
    id: "cancel-us",
    h: "If we cancel or change a service",
    body: (
      <>
        <p>
          We may cancel or change a service for safety, weather, road closures, official restrictions or events beyond our control. Hot air balloon flights
          depend on the weather on the morning itself. When we cancel, you choose between another date and cancelling without charge. If you have paid
          anything for that service, we refund it in full.
        </p>
        <p>
          If a significant part of a service cannot be delivered once it has started, we offer a fair alternative or a partial refund of what was paid for
          that part.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    h: "Refunds and complaints",
    body: (
      <>
        <p>
          If something is not right, tell the driver or message us on WhatsApp straight away so we can fix it while you are still here. Most problems are
          easiest to solve on the day.
        </p>
        <p>
          You can also send a complaint within 7 days of the service to our WhatsApp number{LEGAL.email ? <> or to {LEGAL.email}</> : null}, with your booking
          reference. We reply within 3 working days.
        </p>
        <p>
          When a refund is due, we send it within 14 days
          {payNow ? ": online payments are refunded through PayPal to the account or card you paid with (your bank may take a few more days to show it), and payments made on the day" : ","}{" "}
          by bank transfer or in cash in Marrakech. We do not refund services that were delivered as described, or parts of a service you chose not to use.
        </p>
      </>
    ),
  },
  {
    id: "pickup",
    h: "Pickup and timing",
    body: (
      <>
        <p>
          Cars cannot reach most doors inside the medina. We meet you at the nearest car access point to your riad and tell you exactly where. A porter can
          be added to carry bags.
        </p>
        <p>
          Please be ready at the pickup point at the time we send you. For day trips and activities, the driver waits up to 15 minutes; after that, the
          service may leave without you and counts as a no-show. For airport pickups, we follow your flight and include 60 minutes of free waiting after
          landing.
        </p>
        <p>Times, distances and durations on the site are approximate and depend on traffic, weather, road works and group pace.</p>
      </>
    ),
  },
  {
    id: "responsibilities",
    h: "Your responsibilities",
    body: (
      <ul>
        <li>Check that every guest is fit for the activity. Product pages list age limits, walking levels and who a service is not suitable for.</li>
        <li>Tell us about allergies, health conditions and pregnancy in the booking notes before the day.</li>
        <li>Children must be supervised by an adult at all times, including in vehicles, at camps and on rooftops.</li>
        <li>Follow the instructions of drivers, guides and activity staff, particularly on quads, buggies, camels and balloons.</li>
        <li>Respect local customs and the homes and villages you visit. We do not provide or carry alcohol.</li>
        <li>Carry your passport or ID when a service needs it, and keep your valuables with you.</li>
      </ul>
    ),
  },
  {
    id: "rentals",
    h: "Kits, rentals and baby equipment",
    body: (
      <>
        <p>
          <strong>Food kits contain nuts</strong> (almonds and other tree nuts) and may contain peanuts, sesame, gluten and dairy. Check the contents on the
          product page and tell us about allergies before you book. We cannot guarantee a nut-free kit.
        </p>
        <p>
          Rented items (travel cots, high chairs, car seats, carriers, pushchairs, crampons, poles) stay our property. Please return them in the condition
          you received them, apart from normal wear. Loss or damage beyond normal wear is charged at repair or replacement cost, which we explain before
          charging.
        </p>
        <p>
          We fit car seats in our own vehicles. When our team sets up a cot or high chair, please check it before use. Parents remain responsible for using
          baby equipment according to the instructions and for supervising their child.
        </p>
      </>
    ),
  },
  {
    id: "riad-services",
    h: "Services at your riad",
    body: (
      <>
        <p>
          For services at your riad or hotel, you confirm that the property allows them, including use of the kitchen for a private chef. We can check with
          the property for you.
        </p>
        <p>
          Our henna artists use natural henna only, never &ldquo;black henna&rdquo;. Skin reactions are rare but possible; ask for a small patch test if you
          have sensitive skin. Massages are for relaxation and are not medical treatment; tell the therapist about any health condition.
        </p>
      </>
    ),
  },
  {
    id: "belongings",
    h: "Luggage and belongings",
    body: (
      <p>
        On the &ldquo;Last day, bags in the van&rdquo; service, luggage stays in a locked vehicle. Keep passports, money, medicine and electronics with you.
        Our liability for lost or damaged luggage is limited to direct, proven loss caused by our negligence. We are not responsible for items left in
        vehicles or at supplier premises after a service ends, but we will do our best to find and return them.
      </p>
    ),
  },
  {
    id: "liability",
    h: "Our liability and insurance",
    body: (
      <>
        <p>
          We deliver every service with reasonable care and skill, using licensed vehicles and insured activities. We are responsible for what we and our
          suppliers do in delivering your booking. We are not responsible for loss caused by your own actions, by third parties unconnected with the
          service, or by events beyond our reasonable control.
        </p>
        <p>
          Where the law allows, our total liability for a booking is limited to the price of that booking. Nothing in these conditions limits liability for
          death or personal injury caused by negligence, or any right you have under Moroccan consumer law (Law 31-08) that cannot be excluded.
        </p>
        <p>We strongly recommend travel insurance that covers medical costs, cancellation and the activities you book.</p>
      </>
    ),
  },
  {
    id: "force-majeure",
    h: "Events beyond our control",
    body: (
      <p>
        We are not liable for failing to deliver a service because of events beyond our reasonable control, such as severe weather, natural events, road or
        border closures, strikes, public health measures or official orders. In these cases we offer another date or cancel without charge, and refund
        anything you have paid for the affected service.
      </p>
    ),
  },
  {
    id: "law",
    h: "Law and disputes",
    body: (
      <p>
        These conditions are governed by Moroccan law. We will always try to settle a disagreement directly and quickly first. If we cannot, the competent
        courts of Marrakech have jurisdiction, without affecting any right you have to bring a claim in your own country under mandatory consumer rules.
        See also our <Link href="/terms">Terms of use</Link> and <Link href="/privacy">Privacy policy</Link>.
      </p>
    ),
  },
  ];
}

export default function BookingConditionsPage() {
  const payNow = paypalEnabled() && supabaseAdmin() !== null;
  return (
    <LegalPage
      title="Booking conditions"
      intro={
        <p>
          The short version: book in a minute, {payNow ? "pay online or on the day" : "pay on the day"}, cancel free up to 24 hours before pickup, and tell
          us straight away if anything isn&rsquo;t right. The full conditions are below. By confirming a booking, you accept them.
        </p>
      }
      sections={buildSections(payNow)}
    />
  );
}
