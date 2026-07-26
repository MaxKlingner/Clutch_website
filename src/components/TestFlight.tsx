export const TESTFLIGHT_INVITE_URL = "https://testflight.apple.com/join/V1b1xznk";

export const TESTFLIGHT_APP_STORE_URL =
  "https://apps.apple.com/app/testflight/id899247664";

const steps = [
  {
    number: "1",
    title: "Téléchargez TestFlight",
    description: "Installez l’app gratuite sur l’App Store.",
    action: {
      label: "Télécharger TestFlight",
      href: TESTFLIGHT_APP_STORE_URL,
      variant: "secondary" as const,
    },
  },
  {
    number: "2",
    title: "Ouvrez le lien d’invitation",
    description: "Rejoignez le programme de test privé Clutch.",
    action: {
      label: "Demander mon accès bêta",
      href: TESTFLIGHT_INVITE_URL,
      variant: "primary" as const,
      id: "telecharger",
      showUrl: true,
    },
  },
  {
    number: "3",
    title: "Installez Clutch",
    description: "Ouvrez l’invitation dans TestFlight et testez en avant-première.",
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

      <ol className="mt-4 space-y-5">
        {steps.map((step) => (
          <li key={step.number} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-white">
              {step.number}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{step.description}</p>
              {step.action ? (
                <div className="mt-2.5 flex flex-col gap-1.5">
                  <a
                    id={"id" in step.action ? step.action.id : undefined}
                    href={step.action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      step.action.variant === "primary"
                        ? "inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep"
                        : "inline-flex items-center justify-center rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent/30"
                    }
                  >
                    {step.action.label}
                  </a>
                  {"showUrl" in step.action && step.action.showUrl ? (
                    <a
                      href={step.action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-xs text-accent underline-offset-2 hover:underline"
                    >
                      {step.action.href}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
