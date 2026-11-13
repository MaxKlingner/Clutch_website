import type { Metadata } from "next";
import RulesPage from "@/components/site/RulesPage";

export const metadata: Metadata = {
  title: "Qui sommes-nous",
  description:
    "Découvrez Clutch, la plateforme belge et gratuite de mise en relation directe entre élèves, parents et professeurs particuliers, sans commission.",
  alternates: { canonical: "/qui-sommes-nous" },
};

export default function Page() {
  return (
    <RulesPage title="Qui sommes-nous">
      <p>
        Clutch sert à trouver le bon professeur, gratuitement : parcourir les profils, comparer, et
        écrire sans frais.
      </p>
      <p>
        Les professeurs — souvent étudiants — enseignent près de chez toi ou à distance. Tu vois leurs
        matières, leur commune, leurs avis, puis tu démarres la conversation quand tu es prêt.
      </p>
      <p>
        Le site et l’app partagent le même espace : annonces, messages et avis.
      </p>
    </RulesPage>
  );
}
