import Link from "next/link";

export default function RulesPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/professeurs" className="text-sm font-semibold text-black/55 transition hover:text-[#087a5c]">
        ← Tous les professeurs
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">{title}</h1>
      <div className="mt-6 space-y-4 rounded-3xl bg-white p-6 text-sm leading-7 text-black/75 shadow-[0_8px_30px_rgba(15,28,26,0.05)] sm:p-8">
        {children}
      </div>
    </main>
  );
}
