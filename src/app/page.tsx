import BetaBanner from "@/components/BetaBanner";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Tutors from "@/components/Tutors";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div id="top" className="flex min-h-full flex-col">
      <BetaBanner />
      <Hero />
      <main>
        <HowItWorks />
        <Tutors />
        <AudienceStrip />
      </main>
      <Footer />
    </div>
  );
}

function AudienceStrip() {
  return (
    <section className="border-t border-line bg-gradient-to-br from-[#0f1c1a] via-[#143029] to-[#0d9f7a] px-6 py-20 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
        <div id="parents">
          <p className="text-sm font-medium tracking-[0.18em] text-white/50 uppercase">
            Pour les parents
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Le bon tuteur, sans le stress.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            Swipez des profils vérifiés, matchez, et réservez des cours adaptés au rythme de votre
            enfant.
          </p>
          <a
            href="#beta"
            className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
          >
            Rejoindre la bêta
          </a>
        </div>
        <div id="devenir-tuteur">
          <p className="text-sm font-medium tracking-[0.18em] text-white/50 uppercase">
            Pour les tuteurs
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Enseignez. Gagnez. À votre rythme.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            Créez votre profil, choisissez vos matières et vos horaires, et touchez vos élèves en
            toute sécurité.
          </p>
          <a
            href="#devenir-tuteur"
            className="mt-8 inline-flex rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Devenir Tuteur
          </a>
        </div>
      </div>
    </section>
  );
}
