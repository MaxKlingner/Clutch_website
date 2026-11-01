import Link from "next/link";

export default function RulesPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm font-semibold text-black/55">
        ← Tous les professeurs
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-black/75">{children}</div>
    </main>
  );
}
