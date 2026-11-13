import Link from "next/link";

export default function BackLink({
  href,
  label,
  fallbackHref = "/professeurs",
  fallbackLabel = "Tous les professeurs",
  className = "text-sm font-semibold text-black/55 transition hover:text-[#087a5c]",
}: {
  href?: string;
  label?: string;
  fallbackHref?: string;
  fallbackLabel?: string;
  className?: string;
}) {
  return (
    <Link href={href ?? fallbackHref} className={className}>
      ← {label ?? fallbackLabel}
    </Link>
  );
}
