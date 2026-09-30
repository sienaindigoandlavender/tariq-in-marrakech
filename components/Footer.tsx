import Link from "next/link";
import { copy } from "@/lib/copy";
import { formatWhatsapp } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-[30px] border-t border-line pb-[34px] pt-6 text-sm text-muted">
      <div className="wrap flex flex-wrap justify-between gap-x-[26px] gap-y-2.5">
        <span>{copy.footer.tagline}</span>
        <span>
          {copy.footer.wa} <span className="tnum select-all font-bold text-ink">{formatWhatsapp()}</span>
        </span>
        <Link href="/dispatch" className="no-underline">
          {copy.footer.dispatch}
        </Link>
      </div>
    </footer>
  );
}
