import Link from "next/link";
import RulesPage from "@/components/site/RulesPage";

export default function Page() {
  return (
    <RulesPage title="Mentions légales">
      <p>
        <strong className="font-semibold text-black">Éditeur du site</strong>
        <br />
        Clutch — plateforme gratuite de mise en relation pour le tutorat, exploitée à titre
        personnel et non commercial par <strong className="font-semibold text-black">Max Klingner</strong> (particulier, sans numéro d’entreprise).
        <br />
        Domicile : Rue des Cerisiers 1, 1390 Grez-Doiceau, Belgique.
        <br />
        Contact :{" "}
        <a href="mailto:hello@clutch.education" className="font-semibold text-[#0d9f7a] underline">
          hello@clutch.education
        </a>
        <br />
        Site : clutch.education
      </p>
      <p>
        <strong className="font-semibold text-black">Hébergement</strong>
        <br />
        Le site web est hébergé par Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723,
        États-Unis). Les données applicatives sont hébergées via Supabase en Union européenne
        (région Paris).
      </p>
      <p>
        <strong className="font-semibold text-black">Propriété intellectuelle</strong>
        <br />
        Les contenus du site (textes, marques, logo) appartiennent à Clutch ou à leurs auteurs. Toute
        reproduction sans accord préalable est interdite.
      </p>
      <p>
        <strong className="font-semibold text-black">Droit applicable</strong>
        <br />
        Le présent site et ses mentions légales sont soumis au droit belge. Pour les règles d’usage,
        voir les{" "}
        <Link href="/conditions" className="font-semibold text-[#0d9f7a] underline">
          conditions d’utilisation
        </Link>
        . Pour les données personnelles, voir la{" "}
        <Link href="/confidentialite" className="font-semibold text-[#0d9f7a] underline">
          confidentialité
        </Link>
        .
      </p>
    </RulesPage>
  );
}
