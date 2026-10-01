import { formatWhatsapp } from "./config";

export type Faq = { q: string; a: string; link?: [string, string] };
export type FaqGroup = { id: string; h: string; items: Faq[] };

/** FAQ content. Plain-text answers so the same text feeds the page and the FAQPage structured data. */
export function faqGroups(payNow: boolean): FaqGroup[] {
  const wa = formatWhatsapp();
  return [
    {
      id: "booking",
      h: "Booking and paying",
      items: [
        {
          q: "How do I book?",
          a: "Pick a trip, transfer or service, choose the date and number of guests, add extras if you want, then confirm with your name, WhatsApp number and riad. You get a booking reference straight away.",
        },
        {
          q: "Do I pay now or on the day?",
          a: payNow
            ? "You choose at checkout. Pay now online with PayPal or a card through PayPal, or reserve now and pay on the day to your driver in cash (dirhams or euros) or by card where available. A few services, like the private chef, are paid online when you book."
            : "Most bookings are paid on the day to your driver, in cash (dirhams or euros) or by card where available. A few services, like the private chef, are paid in advance through a secure link we send you.",
        },
        {
          q: "Which currencies can I pay in?",
          a: "Euros or Moroccan dirhams. Prices in US dollars or pounds are shown as a guide only.",
        },
        {
          q: "Are there booking fees or taxes on top?",
          a: "No. The price at checkout is the price you pay. Items listed as not included, such as lunches or tips, are paid directly.",
        },
        {
          q: "Can I give a trip as a present?",
          a: "Yes. Gift vouchers of €50, €100 or €200, sent on WhatsApp on the date you choose with your message. Valid 12 months on anything we sell.",
          link: ["/c/gft", "Gift vouchers"],
        },
        {
          q: "Can I ask for a female driver or guide?",
          a: "Yes, on most transfers, day trips and tours. Tick it when you book. It's free, and we confirm on WhatsApp.",
        },
        {
          q: "Do I need an account to book?",
          a: "No. An account is optional. It keeps your wishlist on every device. You sign in with a link sent to your email, no password.",
          link: ["/account", "Create an account"],
        },
      ],
    },
    {
      id: "cancel",
      h: "Changes and cancellation",
      items: [
        {
          q: "Can I cancel for free?",
          a: `Yes, up to 24 hours before pickup for almost everything. Reply CANCEL to your WhatsApp confirmation or message ${wa}. Prepaid bookings are refunded in full to the original payment method.`,
          link: ["/booking-conditions#cancel-you", "Booking conditions"],
        },
        {
          q: "Why is the private chef non-refundable?",
          a: "The cook plans your menu and shops at the souk for you days before. That's why the private chef dinner must be booked at least 3 days ahead, is paid online when you book, and can't be refunded once booked. If we have to cancel it, you get a full refund.",
          link: ["/p/chef", "Private chef dinner"],
        },
        {
          q: "Can I change the date or number of guests?",
          a: "Yes, free up to 24 hours before pickup, subject to availability. Message us on WhatsApp with your booking reference.",
        },
        {
          q: "What if the weather cancels my balloon flight?",
          a: "The pilot decides on the morning. You choose another date or a full refund.",
        },
      ],
    },
    {
      id: "pickup",
      h: "Pickup and transfers",
      items: [
        {
          q: "When do I get my pickup time?",
          a: "The evening before, on WhatsApp, with your driver's name.",
        },
        {
          q: "Can you pick me up inside the medina?",
          a: "Cars can't reach most riad doors. We meet you at the nearest car access point and tell you exactly where. A porter can carry your bags.",
        },
        {
          q: "My flight is delayed. What happens?",
          a: "Put your flight number in the booking notes. We track the flight, and the first 60 minutes of waiting are free.",
        },
        {
          q: "Do you have child seats?",
          a: "Yes. Add a child car seat when you book the airport transfer. For day trips, tell us the children's ages in the notes.",
        },
      ],
    },
    {
      id: "journeys",
      h: "Day trips, tours and activities",
      items: [
        {
          q: "What's the difference between Agafay and the Sahara?",
          a: "Agafay is a stone desert 40 minutes from Marrakech, good for a sunset dinner. The big Sahara dunes at Merzouga are about 9 hours away by road, so they need the 3-day tour, or 4 days if you finish in Fes.",
          link: ["/c/des", "Multi-day tours"],
        },
        {
          q: "Shared or private?",
          a: "Shared trips run in a minivan with other travellers. Most trips have a private option: your own car and driver, your own pace.",
        },
        {
          q: "Are your monument tickets official?",
          a: "We are not the monuments' ticket office. We buy the official entry ticket for you, and a host meets you at the gate at the time you chose, so you skip the ticket queue. Our price includes the ticket and that service.",
          link: ["/c/tkt", "Skip the line"],
        },
        {
          q: "Are there shopping stops?",
          a: "No. Our drivers don't stop at shops or carpet cooperatives unless you ask.",
        },
      ],
    },
    {
      id: "concierge",
      h: "Concierge services",
      items: [
        {
          q: "What can you arrange at my riad?",
          a: "A henna artist in the evening, a massage, a barber, a photographer for a medina shoot, and a private chef dinner. They come to you.",
          link: ["/c/svc", "Concierge"],
        },
        {
          q: "Can you book restaurants?",
          a: "Yes, for free. Tell us the restaurant, time and number of guests and we call, book and confirm on WhatsApp. Add a ride there and back if you need one.",
          link: ["/p/table", "Book a table"],
        },
        {
          q: "Can you get us into Bacha Coffee without the wait?",
          a: "Bacha Coffee takes no reservations, so we get you in at opening, before the queue builds, with the Dar el Bacha ticket already bought and a host at the door.",
          link: ["/p/bacha", "Bacha Coffee, no queue"],
        },
        {
          q: "Can I rent baby gear?",
          a: "Yes. The baby kit, with a travel cot, high chair and car seat, is delivered and set up at your riad.",
          link: ["/c/svc", "Concierge, kits & baby"],
        },
      ],
    },
    {
      id: "help",
      h: "Getting help",
      items: [
        {
          q: "How do I reach you?",
          a: `WhatsApp ${wa}, daily 8:00 to 22:00. Or tap Ask Tariq at the bottom of any page for an instant answer.`,
          link: ["/contact", "Contact"],
        },
        {
          q: "Can you plan my whole trip?",
          a: "Yes. Tell us your dates, group and budget, and a real person sends you a plan with prices on WhatsApp. Free, no obligation.",
          link: ["/plan", "Plan my trip"],
        },
      ],
    },
  ];
}
