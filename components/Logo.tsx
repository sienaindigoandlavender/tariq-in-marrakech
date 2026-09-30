import Link from "next/link";
import { copy } from "@/lib/copy";

export function Logo() {
  return (
    <Link href="/" className="flex flex-none items-center gap-[9px] no-underline">
      <i aria-hidden="true" className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-blue font-display text-[20px] font-black not-italic text-blue-ink">
        T
      </i>
      <b className="display text-[26px] tracking-[.02em]">{copy.brand}</b>
    </Link>
  );
}
