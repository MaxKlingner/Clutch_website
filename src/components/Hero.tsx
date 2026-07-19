import TestFlightGuide from "@/components/TestFlight";

export default function Hero() {
  return (
    <header className="relative min-h-[100svh] overflow-hidden hero-mesh">
      <div className="noise-overlay absolute inset-0 opacity-60 pointer-events-none" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8">
        <a href="#top" className="font-display text-xl font-bold tracking-tight text-ink">
          Clutch
        </a>
        <div className="hidden items-center gap-8 text-sm text-ink-soft sm:flex">
          <a href="#fonctionnement" className="transition hover:text-ink">
            Fonctionnement
          </a>
          <a href="#tuteurs" className="transition hover:text-ink">
            Tuteurs
          </a>
          <a
            href="#devenir-tuteur"
            className="rounded-lg bg-ink px-4 py-2 font-medium text-white transition hover:bg-ink-soft"
          >
            Devenir Tuteur
          </a>
        </div>
      </nav>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-20 lg:pt-10">
        <div className="max-w-xl">
          <h1 className="animate-rise font-display text-[clamp(3.5rem,12vw,7.5rem)] font-bold leading-[0.9] tracking-tight text-ink">
            Clutch
          </h1>
          <p className="animate-rise-delay-1 mt-6 max-w-md text-xl leading-snug font-medium text-ink-soft sm:text-2xl">
            Par des étudiants, pour des étudiants
          </p>
          <p className="animate-rise-delay-2 mt-3 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Retrouvez des professeurs particuliers — des étudiants du supérieur — et matchez en un
            swipe.
          </p>

          <div className="animate-rise-delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#beta"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-center text-base font-semibold text-white transition hover:bg-accent-deep"
            >
              Rejoindre la bêta
            </a>
            <a
              href="#devenir-tuteur"
              className="inline-flex items-center justify-center rounded-xl border border-ink/15 bg-white/60 px-6 py-3.5 text-center text-base font-semibold text-ink backdrop-blur-sm transition hover:border-ink/30 hover:bg-white"
            >
              Devenir Tuteur
            </a>
          </div>
        </div>

        <div className="animate-rise-delay-2 relative mx-auto flex w-full max-w-[360px] flex-col gap-5">
          <TestFlightGuide />
          <div className="animate-float relative mx-auto w-full max-w-[300px]">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </header>
  );
}

function PhoneMockup() {
  return (
    <div
      className="relative mx-auto aspect-[9/18.5] w-full overflow-hidden rounded-[2.4rem] border-[5px] border-ink bg-ink shadow-[0_40px_80px_-28px_rgba(15,28,26,0.45)]"
      aria-hidden
    >
      <div className="absolute inset-[3px] overflow-hidden rounded-[2rem] bg-[#f7faf8]">
        <div className="absolute top-0 left-1/2 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-ink" />

        <div className="flex h-full flex-col px-4 pt-10 pb-5">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold text-ink">Clutch</span>
            <span className="text-[10px] font-medium tracking-wide text-muted uppercase">
              Maths · Lycée
            </span>
          </div>

          <div className="relative mt-5 flex-1">
            <div className="absolute inset-x-2 top-4 rotate-[-6deg] rounded-2xl border border-line bg-white p-4 opacity-50 shadow-sm" />
            <div className="absolute inset-x-1 top-2 rotate-[3deg] rounded-2xl border border-line bg-white p-4 opacity-75 shadow-sm" />

            <div className="relative z-10 flex h-full flex-col rounded-2xl border border-line bg-white p-4 shadow-md">
              <div className="h-36 overflow-hidden rounded-xl bg-gradient-to-br from-accent to-accent-deep">
                <div className="flex h-full items-end p-3">
                  <div>
                    <p className="font-display text-lg font-bold text-white">Camille D.</p>
                    <p className="text-xs text-white/80">Master 2 · Maths</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-2 w-4/5 rounded bg-ink/8" />
                <div className="h-2 w-3/5 rounded bg-ink/8" />
                <div className="h-2 w-2/3 rounded bg-ink/8" />
              </div>

              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="font-display text-xl font-bold text-accent">28€/h</span>
                <span className="rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft">
                  ★ 4.9
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-lg text-accent-warm">
              ✕
            </span>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl text-white shadow-lg shadow-accent/25">
              ♥
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
