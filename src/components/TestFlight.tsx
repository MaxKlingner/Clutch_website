export const TESTFLIGHT_INVITE_URL = "https://testflight.apple.com/join/V1b1xznk";

export const TESTFLIGHT_APP_STORE_URL =
  "https://apps.apple.com/app/testflight/id899247664";

export default function TestFlightGuide() {
  return (
    <div
      id="beta"
      className="w-full rounded-2xl border border-line bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6"
    >
      <h2 className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
        Rejoindre la bêta Clutch
      </h2>

      <ol className="mt-6 space-y-6">
        <li className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-white">
            1
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-ink">
              Installez l’app TestFlight
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              C’est l’application gratuite d’Apple qui permet d’installer des versions bêta.
            </p>
            <a
              href={TESTFLIGHT_APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/35 hover:bg-accent/5"
            >
              Ouvrir TestFlight sur l’App Store
            </a>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-white">
            2
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-ink">
              Acceptez l’invitation Clutch
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Ce lien vous ajoute au programme de test privé. Sur iPhone, il s’ouvre directement
              dans TestFlight.
            </p>
            <a
              id="telecharger"
              href={TESTFLIGHT_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block break-all text-sm font-medium text-accent underline-offset-2 hover:underline"
            >
              {TESTFLIGHT_INVITE_URL}
            </a>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-white">
            3
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-ink">Installez Clutch</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Dans TestFlight, appuyez sur <span className="font-medium text-ink">Accepter</span>,
              puis sur <span className="font-medium text-ink">Installer</span>. Vous pourrez ensuite
              ouvrir Clutch comme une app normale.
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
