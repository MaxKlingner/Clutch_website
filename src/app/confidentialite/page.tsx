import type { Metadata } from "next";
import Link from "next/link";
import RulesPage from "@/components/site/RulesPage";

export const metadata: Metadata = {
  title: "Confidentialité et RGPD",
  description:
    "Politique de confidentialité et protection des données personnelles (RGPD) sur Clutch.",
  alternates: { canonical: "/confidentialite" },
};

export default function Page() {
  return (
    <RulesPage title="Confidentialité">
      <p>
        Clutch (édité par Max Klingner, Rue des Cerisiers 1, 1390 Grez-Doiceau, Belgique) collecte
        uniquement les données nécessaires au fonctionnement gratuit de la mise en relation entre
        élèves, parents et professeurs particuliers.
      </p>
      <p>
        <strong className="font-semibold text-black">Données enregistrées</strong>
        <br />
        Le compte contient le prénom, le nom, l’adresse e-mail, la date de naissance, le téléphone,
        l’adresse postale, le genre (facultatif) et la photo. L’annonce publique affiche le prénom, la
        photo, la commune, les matières, les niveaux, les formats, le tarif horaire et les textes de
        présentation. Si le professeur choisit d’ajouter un numéro de téléphone sur son annonce,
        celui-ci reste masqué aux visiteurs sans compte et n’est visible que par les membres
        connectés. Les discussions, avis, réponses et signalements sont également enregistrés.
      </p>
      <p>
        <strong className="font-semibold text-black">Finalités, notifications et modération</strong>
        <br />
        Ces informations servent à afficher les annonces, permettre la messagerie entre membres,
        calculer la note moyenne, envoyer des notifications par e-mail lors de
        nouveaux messages (désactivables depuis la page{" "}
        <Link href="/compte" className="font-semibold text-[#0d9f7a] underline">
          Compte
        </Link>
        ) et traiter les signalements. Les messages privés ne sont consultés par l’éditeur qu’en cas
        de signalement. Les données ne sont jamais vendues.
      </p>
      <p>
        <strong className="font-semibold text-black">Prestataires techniques</strong>
        <br />
        Le service repose sur Vercel (hébergement web), Supabase (base de données et stockage de
        fichiers en région Union européenne — Paris), Clerk (authentification et session), Resend
        (envoi des e-mails de notification) et OpenStreetMap (affichage de la carte).
      </p>
      <p>
        <strong className="font-semibold text-black">Durée de conservation</strong>
        <br />
        Les données du compte, de l’annonce et des échanges sont conservées tant que le compte reste
        actif. Lorsque tu supprimes ton compte depuis la page{" "}
        <Link href="/compte" className="font-semibold text-[#0d9f7a] underline">
          Compte
        </Link>
        , tes données de profil et ton annonce sont immédiatement supprimées ou anonymisées.
      </p>
      <p>
        <strong className="font-semibold text-black">Cookies</strong>
        <br />
        Seuls les cookies techniques nécessaires à la connexion et à la session sont utilisés. Aucun
        traceur publicitaire n’est présent sur le site.
      </p>
      <p>
        <strong className="font-semibold text-black">Tes droits (RGPD)</strong>
        <br />
        Conformément au RGPD, tu disposes d’un droit d’accès, de rectification, d’effacement, de
        limitation et d’opposition sur tes données. Pour les exercer, écris à{" "}
        <a href="mailto:max.r.klingner@gmail.com" className="font-semibold text-[#0d9f7a] underline">
          max.r.klingner@gmail.com
        </a>
        . Tu peux aussi introduire une réclamation auprès de l’Autorité de protection des données
        (APD) en Belgique sur{" "}
        <a
          href="https://www.autoriteprotectiondonnees.be"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#0d9f7a] underline"
        >
          autoriteprotectiondonnees.be
        </a>
        .
      </p>
    </RulesPage>
  );
}
