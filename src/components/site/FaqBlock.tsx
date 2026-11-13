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
    <section className="rounded-3xl border border-[#087a5c]/12 bg-white p-6 shadow-[0_8px_30px_rgba(15,28,26,0.04)] sm:p-10">
      <p className="text-xs font-extrabold tracking-[0.16em] text-[#087a5c] uppercase">FAQ</p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#0f1c1a] sm:text-3xl">
        {title}
      </h2>

      <div className="mt-6 divide-y divide-[#087a5c]/10 border-t border-[#087a5c]/10">
        {items.map((item, index) => (
          <details
            key={item.question}
            open={index === 0}
            className="group py-5 transition-colors open:rounded-2xl open:bg-[#f4fbf8] open:px-4 open:-mx-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left [&::-webkit-details-marker]:hidden">
              <span className="text-base font-bold text-[#0f1c1a] transition group-open:text-[#087a5c] group-hover:text-[#087a5c]">
                {item.question}
              </span>
              <span
                aria-hidden="true"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e7f6f1] text-lg font-medium text-[#087a5c] transition-all duration-200 group-open:rotate-45 group-open:bg-[#087a5c] group-open:text-white"
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-3xl pr-10 text-sm leading-7 text-black/70">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
