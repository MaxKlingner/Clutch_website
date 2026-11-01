import SiteHeader from "@/components/site/SiteHeader";
import Link from "next/link";

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f8] text-[#1c1c1c]">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-4 gap-y-1 px-4 py-4 text-sm font-semibold text-black/45 sm:px-6">
          <Link href="/conditions">Conditions</Link>
          <Link href="/confidentialite">Confidentialité</Link>
        </div>
      </footer>
    </div>
  );
}
