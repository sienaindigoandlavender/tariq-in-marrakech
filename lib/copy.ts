// All customer-facing strings live here so a translation layer can wrap this later.
export const copy = {
  brand: "Tariq",
  city: "Marrakech",

  nav: {
    main: "Main",
    tabs: "Tabs",
    explore: "Explore",
    dayTrips: "Day trips",
    desert: "Desert",
    transfers: "Transfers",
    atRiad: "At your riad",
    kits: "Kits & baby",
    ask: "Ask Tariq",
    myTrip: "My trip",
    book: "Book",
    tariq: "Tariq",
    currency: "Currency",
  },

  categories: {
    all: "All",
    exc: "Day trips",
    des: "Desert",
    act: "Activities",
    trf: "Transfers",
    svc: "At your riad",
    kit: "Kits & baby",
  },

  hero: {
    h1: "Everything for your Marrakech trip.",
    h1Em: "One place.",
    placeholder: "Landing at 2am with a baby. What do I book?",
    askBtn: "Ask Tariq",
  },

  promises: [
    "Pay on arrival",
    "Pickup time on WhatsApp",
    "Licensed transport",
    "No shopping stops",
    "Free cancellation up to 24 h",
  ],

  book: { h: "Book", p: "Final prices. Nothing to pay until the day." },

  listing: {
    date: "Date",
    guests: "Guests",
    fewer: "Fewer guests",
    more: "More guests",
    sort: "Sort",
    sortRecommended: "Recommended",
    sortLow: "Price low to high",
    sortHigh: "Price high to low",
    results: (n: number) => `${n} ${n === 1 ? "result" : "results"}`,
    freeCancel: "Free cancellation",
    payOnArrival: "Pay on arrival",
    save: "Save",
    unsave: "Remove from saved",
    empty: "Nothing in this category yet.",
  },
  solved: {
    h: "Solved before you ask",
    p: "The things nobody else sorts out for you. Added to any booking, delivered in the van that's already coming.",
  },
  how: [
    { b: "Book in a minute", s: "Pick a trip or a fix, choose the date, tell us your riad. Nothing to pay now." },
    { b: "Get your pickup time", s: "The evening before, your driver's name and exact time arrive on WhatsApp." },
    { b: "Pay on the day", s: "Cash in dirhams or euros, or card. You get a receipt." },
  ],

  concierge: {
    h: "Ask Tariq",
    p: "Your Marrakech concierge. Transfers, trips, kits, a henna artist at 9pm. Ask anything.",
    placeholder: "Ask about your trip",
    send: "Send",
    hi: "Hi, I'm Tariq. Tell me your dates, who's travelling and what's worrying you. I'll sort the rest.",
    thinking: "Tariq is thinking…",
    offline: "I can't reach the concierge right now, so here's what matches in the catalogue:",
    nomatch: "Nothing matches that exactly. Message the team on WhatsApp and a person will sort it:",
    error: "Something went wrong on my side. Try again in a moment.",
    suggestions: [
      "Landing at 2am, 2 adults and a baby",
      "We have 4 days, what should we book?",
      "Checkout at noon, flight at 9pm",
      "Is Agafay the Sahara?",
    ],
  },

  trip: {
    h: "My trip",
    p: "Everything you booked, in order.",
    empty: "Nothing booked yet. Start with the airport pickup, or ask Tariq what fits your dates.",
    total: "To pay on the day",
    wa: "Send my trip to WhatsApp",
    saved: "Saved",
  },

  price: {
    pp: "per person",
    car: "per car",
    flat: "per stay",
    unit: "each",
    from: "from",
  },

  checkout: {
    date: "Date",
    guests: "Guests",
    pickupAt: "Your riad or hotel",
    pickupPlaceholder: "Riad name, derb or hotel",
    name: "Full name",
    phone: "WhatsApp number",
    phonePlaceholder: "+33 6 12 34 56 78",
    notes: "Notes (flight number, restaurant, allergies, baby's age)",
    total: "Total, paid on the day",
    confirm: "Confirm booking",
    noPay: "Nothing is charged now. Free cancellation up to 24 h before.",
    shared: "Shared",
    sharedS: "Small group minivan",
    private: "Private",
    privateS: "Your own car and driver",
    extras: "Add to it",
    popular: "Popular",
    base: "Booking",
    continue: "Continue",
    errors: {
      date: "Choose a date from tomorrow onwards.",
      pickup: "Tell us where you're staying.",
      name: "Add the name of the lead guest.",
      phone: "Add a WhatsApp number with country code, for example +33 6 12 34 56 78.",
    },
  },

  done: {
    h: "Booking confirmed",
    p: "Your pickup time and driver's name arrive on WhatsApp the evening before.",
    ref: "Reference",
    booking: "Booking",
    when: "Date",
    who: "Guests",
    where: "Pickup",
    with: "Extras",
    pay: "To pay on the day",
    sendWa: "Send to WhatsApp",
    seeTrip: "See my trip",
    xsell: "Often added next",
    add: "Add",
  },

  footer: {
    tagline: "Tariq · Marrakech",
    wa: "WhatsApp, daily 8:00–22:00:",
    dispatch: "Dispatch",
  },
} as const;

export type Copy = typeof copy;
