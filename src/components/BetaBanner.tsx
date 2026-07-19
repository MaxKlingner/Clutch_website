export default function BetaBanner() {
  return (
    <div className="sticky top-0 z-50 border-b border-accent-deep/20 bg-accent text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row sm:gap-4 sm:px-8 sm:py-3.5">
        <p className="text-center text-sm font-medium leading-snug sm:text-left sm:text-base">
          <span aria-hidden className="mr-1.5">
            🚀
          </span>
          <span className="font-semibold">Version bêta en cours de développement</span>
          <span className="hidden text-white/85 sm:inline">
            {" "}
            — Rejoignez le programme de test privé.
          </span>
        </p>
        <a
          href="#beta"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-accent-deep transition hover:bg-white/90"
        >
          Comment rejoindre
        </a>
      </div>
    </div>
  );
}
