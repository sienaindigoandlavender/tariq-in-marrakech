export type Category = "exc" | "des" | "act" | "trf" | "svc" | "kit";
export type Role = "lead" | "core" | "cow" | "gap";
export type Per = "pp" | "car" | "flat";
export type AddonPer = "pp" | "car" | "unit";
export type Mode = "shared" | "private";
export type BookingStatus = "pending_payment" | "confirmed" | "reminded" | "picked" | "paid" | "noshow" | "cancelled";
export type BookingSource = "web" | "concierge" | "riad_qr" | "whatsapp";
export type PaymentMethod = "on_arrival" | "paypal";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded" | "failed";

export const CATEGORIES: Category[] = ["exc", "des", "act", "trf", "svc", "kit"];

export type Addon = {
  id: string;
  label: string;
  eur: number;
  per: AddonPer;
  popular: boolean;
  sort: number;
};

export type Product = {
  id: string;
  city: string;
  category: Category;
  /** Internal merchandising role. Never shown to customers. */
  role: Role;
  title: string;
  subtitle: string;
  blurb: string;
  timing: string;
  duration: string;
  km: number;
  drive_time: string;
  price_eur: number;
  was_eur: number | null;
  per: Per;
  cap: number | null;
  private_per_car: number | null;
  badge: string | null;
  scene: string;
  image_url: string | null;
  highlights: string[];
  includes: string[];
  excludes: string[];
  know_before: string[];
  /** Product page timeline. */
  itinerary: { t: string; s: string }[];
  sort: number;
  active: boolean;
  /** Minimum days between today and the service date (1 = tomorrow). */
  lead_days: number;
  /** Must be paid online at booking; no pay-on-the-day option. */
  prepay_only: boolean;
  /** False = no refund after booking. */
  refundable: boolean;
  addons: Addon[];
};

/** Customer-safe product shape (no internal role) for client components. */
export type PublicProduct = Omit<Product, "role">;

export type BookingAddon = { id: string; label: string; eur: number; qty: number; line_eur: number };

export type Booking = {
  ref: string;
  city: string;
  product_id: string;
  product_title: string;
  role: Role;
  date: string;
  guests: number;
  mode: Mode;
  addons: BookingAddon[];
  pickup: string;
  lead_name: string;
  phone: string;
  notes: string | null;
  base_eur: number;
  extra_eur: number;
  total_eur: number;
  status: BookingStatus;
  source: BookingSource;
  partner_code: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  paid_eur: number;
  created_at: string;
};
