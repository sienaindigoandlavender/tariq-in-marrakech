import type { Metadata, Viewport } from "next";
import { Big_Shoulders_Display, Figtree } from "next/font/google";
import { AppStateProvider } from "@/components/AppState";
import { TopBar } from "@/components/TopBar";
import { TabBar } from "@/components/TabBar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const display = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-display",
  display: "swap",
});
const body = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Tariq · Marrakech tours, transfers and trip services", template: "%s | Tariq" },
  description:
    "Airport transfers, day trips, desert tours and the things nobody else sorts out in Marrakech. Pay on arrival, free cancellation up to 24 h.",
};

export const viewport: Viewport = {
  themeColor: "#1f3fbf",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AppStateProvider>
          <TopBar />
          <main className="phone:pb-[calc(var(--tabh)+24px+env(safe-area-inset-bottom,0px))]">{children}</main>
          <Footer />
          <TabBar />
        </AppStateProvider>
      </body>
    </html>
  );
}
