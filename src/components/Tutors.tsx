const tutors = [
  {
    name: "Camille Dupont",
    level: "Étudiante en Master 2",
    subject: "Mathématiques",
    rate: "28€/h",
    rating: "4.9",
    initials: "CD",
    tone: "from-[#0d9f7a] to-[#087a5c]",
  },
  {
    name: "Lucas Martin",
    level: "Étudiant en Licence 3",
    subject: "Physique-Chimie",
    rate: "24€/h",
    rating: "4.8",
    initials: "LM",
    tone: "from-[#1a6b8a] to-[#0f4c63]",
  },
  {
    name: "Inès Benali",
    level: "Étudiante en Master 1",
    subject: "Anglais",
    rate: "26€/h",
    rating: "5.0",
    initials: "IB",
    tone: "from-[#ff5c3a] to-[#d44528]",
  },
  {
    name: "Hugo Lefèvre",
    level: "Étudiant en Prépa",
    subject: "Informatique",
    rate: "30€/h",
    rating: "4.7",
    initials: "HL",
    tone: "from-[#2a3d39] to-[#0f1c1a]",
  },
];

export default function Tutors() {
  return (
    <section
      id="tuteurs"
      className="relative border-t border-line bg-surface-elevated px-6 py-24 sm:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase">
            Nos tuteurs
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Des profils qui inspirent confiance
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Étudiants passionnés, matières maîtrisées, tarifs transparents.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tutors.map((tutor) => (
            <article
              key={tutor.name}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-white"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${tutor.tone} font-display text-lg font-bold text-white`}
                aria-hidden
              >
                {tutor.initials}
              </div>

              <h3 className="mt-5 font-display text-lg font-semibold text-ink">{tutor.name}</h3>
              <p className="mt-1 text-sm text-muted">{tutor.level}</p>
              <p className="mt-3 text-sm font-medium text-ink-soft">{tutor.subject}</p>

              <div className="mt-auto flex items-center justify-between pt-6">
                <span className="font-display text-xl font-bold text-accent">{tutor.rate}</span>
                <span className="text-sm text-muted">★ {tutor.rating}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
