const steps = [
  {
    number: "01",
    title: "Swipe",
    description:
      "Parcourez des profils de tuteurs vérifiés et trouvez celui qui correspond à votre matière et à votre style.",
  },
  {
    number: "02",
    title: "Match",
    description:
      "Quand l’intérêt est réciproque, vous êtes connectés. Plus de recherche interminable : un vrai fit.",
  },
  {
    number: "03",
    title: "Cours",
    description:
      "Planifiez vos séances en quelques taps — en présentiel ou en ligne, selon vos disponibilités.",
  },
  {
    number: "04",
    title: "Paiement sécurisé",
    description:
      "Réglez en toute confiance. Les fonds sont protégés jusqu’à la fin du cours.",
  },
];

export default function HowItWorks() {
  return (
    <section id="fonctionnement" className="relative bg-surface px-6 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase">
            Comment ça marche
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Quatre étapes. Zéro friction.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Clutch simplifie le tutorat pour les parents comme pour les étudiants qui enseignent.
          </p>
        </div>

        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step) => (
            <li key={step.number} className="group relative">
              <span className="font-display text-5xl font-bold tracking-tight text-accent/20 transition-colors duration-300 group-hover:text-accent/35">
                {step.number}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
