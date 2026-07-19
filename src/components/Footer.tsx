export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-2xl font-bold tracking-tight">Clutch</p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Le tutorat qui matche. Connectez parents et tuteurs étudiants en un swipe.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-10 sm:grid-cols-3" aria-label="Pied de page">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-white/40 uppercase">
              Produit
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <a href="#fonctionnement" className="transition hover:text-white">
                  Fonctionnement
                </a>
              </li>
              <li>
                <a href="#tuteurs" className="transition hover:text-white">
                  Tuteurs
                </a>
              </li>
              <li>
                <a href="#beta" className="transition hover:text-white">
                  Rejoindre la bêta
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-white/40 uppercase">
              Communauté
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <a href="#devenir-tuteur" className="transition hover:text-white">
                  Devenir tuteur
                </a>
              </li>
              <li>
                <a href="#parents" className="transition hover:text-white">
                  Pour les parents
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-white/40 uppercase">
              Légal
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <a href="#" className="transition hover:text-white">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-white">
                  Conditions
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Clutch. Tous droits réservés.</p>
          <p>Fait pour les familles et les étudiants qui enseignent.</p>
        </div>
      </div>
    </footer>
  );
}
