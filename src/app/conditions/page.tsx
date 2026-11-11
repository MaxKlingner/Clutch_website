import Link from "next/link";
import RulesPage from "@/components/site/RulesPage";

export default function Page() {
  return (
    <RulesPage title="Conditions d’utilisation">
      <p>
        Clutch est une plateforme de mise en relation gratuite et non commerciale, sans frais
        d’inscription ni commission, entre personnes qui cherchent un cours particulier et personnes
        qui en donnent.
      </p>
      <p>
        Pour créer un compte, il faut avoir au moins 18 ans. Un élève plus jeune peut suivre le cours,
        mais le compte appartient à un adulte responsable.
      </p>
      <p>Une personne n’a qu’un seul compte. Tu confirmes cette règle en t’inscrivant.</p>
      <p>
        L’annonce décrit tes matières, ton tarif horaire, ton diplôme éventuel et ta façon de donner
        cours. Tu peux aussi choisir d’y afficher un numéro de téléphone (visible uniquement par les
        utilisateurs connectés avec un compte). Les contenus commerciaux non sollicités ou le spam
        restent interdits.
      </p>
      <p>
        <strong className="font-semibold text-black">Absence de vérification et responsabilité</strong>
        <br />
        Clutch agit uniquement comme intermédiaire technique gratuit. Clutch ne vérifie pas
        l’authenticité des diplômes, les compétences pédagogiques ni le casier judiciaire des
        professeurs. Chaque utilisateur publie sous sa propre responsabilité. Les cours, horaires et
        modalités éventuelles sont convenus directement entre particuliers, en dehors du site.
      </p>
      <p>
        Un avis ne peut être laissé par l’élève ou le parent qu’après un échange effectif de
        messages dans la conversation. Le professeur peut répondre sous l’avis. L’avis et la
        réponse restent visibles sur la fiche.
      </p>
      <p>
        Chaque professeur s’engage à publier des informations exactes et à répondre avec sérieux
        aux demandes des familles.
      </p>
      <p>
        <strong className="font-semibold text-black">Signalement et modération</strong>
        <br />
        Tu peux signaler un profil ou une conversation. Les échanges ne sont consultés par l’éditeur
        qu’en cas de signalement. Clutch peut retirer une annonce ou suspendre un compte qui ne
        respecte pas ces règles. Tu peux supprimer ton compte à tout moment depuis la page{" "}
        <Link href="/compte" className="font-semibold text-[#0d9f7a] underline">
          Compte
        </Link>
        .
      </p>
      <p>Les présentes conditions sont régies par le droit belge.</p>
    </RulesPage>
  );
}
