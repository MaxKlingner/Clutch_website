export const TESTFLIGHT_INVITE_URL = "https://testflight.apple.com/join/V1b1xznk";

export const TESTFLIGHT_APP_STORE_URL =
  "https://apps.apple.com/app/testflight/id899247664";

const steps = [
  {
    number: "1",
    title: "Téléchargez TestFlight",
    description: "App gratuite sur l’App Store.",
  },
  {
    number: "2",
    title: "Ouvrez le lien d’invitation",
    description: "Utilisez le bouton ci-dessous pour rejoindre le programme privé.",
  },
  {
    number: "3",
    title: "Installez Clutch",
    description: "Et testez en avant-première.",
  },
];

export default function TestFlightGuide() {
  return (
    <div
      id="beta"
      className="w-full rounded-2xl border border-line bg-white/80 p-5 shadow-sm backdrop-blur-sm"
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
        Rejoindre la bêta
      </p>
      <h2 className="mt-2 font-display text-lg font-bold tracking-tight text-ink">
        Comment tester sur TestFlight
      </h2>

      <ol className="mt-4 space-y-3">
        {steps.map((step) => (
          <li key={step.number} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-white">
              {step.number}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{step.title}</p>
              <p className="text-xs leading-relaxed text-muted">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-col gap-2">
        <a
          id="telecharger"
          href={TESTFLIGHT_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep"
        >
          Demander mon accès bêta
        </a>
        <a
          href={TESTFLIGHT_APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/30"
        >
          Télécharger TestFlight
        </a>
        <a
          href={TESTFLIGHT_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-center text-xs text-accent underline-offset-2 hover:underline"
        >
          {TESTFLIGHT_INVITE_URL}
        </a>
      </div>
    </div>
  );
}
