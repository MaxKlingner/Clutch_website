import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const EXPLORE_LINKS = [
  { href: "/professeurs", label: "Tous les professeurs" },
  { href: "/cours/mathematiques", label: "Cours de maths" },
  { href: "/cours/anglais", label: "Cours d’anglais" },
  { href: "/villes/bruxelles", label: "Professeurs à Bruxelles" },
  { href: "/villes/louvain-la-neuve", label: "Louvain-la-Neuve" },
] as const;

const ABOUT_LINKS = [
  { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
] as const;

const HELP_LINKS = [
  { href: "/contact", label: "Contact" },
  { href: "/app", label: "App" },
  { href: "/conditions", label: "Conditions" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-black/5 bg-white text-[#1c1c1c]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <BrandLogo size={32} />
          <p className="mt-3 max-w-xs text-sm leading-6 text-black/55">
            Trouvez le bon professeur particulier en Belgique ou à distance, gratuitement et sans commission.
          </p>
        </div>

        <div>
          <p className="text-sm font-extrabold text-[#12382c]">Explorer</p>
          <ul className="mt-4 space-y-2.5 text-sm text-black/65">
            {EXPLORE_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-[#0d9f7a]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-extrabold text-[#12382c]">À propos</p>
          <ul className="mt-4 space-y-2.5 text-sm text-black/65">
            {ABOUT_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-[#0d9f7a]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-extrabold text-[#12382c]">Aide</p>
          <ul className="mt-4 space-y-2.5 text-sm text-black/65">
            {HELP_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-[#0d9f7a]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-black/5">
        <div className="mx-auto flex max-w-6xl px-4 py-5 sm:px-6">
          <p className="text-sm text-black/45">© {year} Clutch</p>
        </div>
      </div>
    </footer>
  );
}
