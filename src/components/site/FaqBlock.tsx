import type { FaqItem } from "@/lib/seo";

export default function FaqBlock({
  title = "Questions fréquentes",
  items,
}: {
  title?: string;
  items: FaqItem[];
}) {
  if (!items.length) return null;
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)] sm:p-8">
      <h2 className="font-display text-2xl font-bold tracking-tight text-[#0f1c1a]">{title}</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.question} className="rounded-2xl bg-[#f6f7f8] p-5">
            <h3 className="text-sm font-extrabold text-[#12382c]">{item.question}</h3>
            <p className="mt-2 text-sm leading-6 text-black/65">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
