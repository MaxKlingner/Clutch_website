import Link from "next/link";
import RulesPage from "@/components/site/RulesPage";

export default function Page() {
  return (
    <RulesPage title="Application Clutch">
      <p>L’application mobile est en cours de développement.</p>
      <p>
        En attendant, tu peux déjà utiliser Clutch sur le web : trouver un professeur, écrire, et
        gérer ton compte sur{" "}
        <Link href="/" className="font-semibold text-[#0d9f7a] underline">
          clutch.education
        </Link>
        .
      </p>
      <p>On te préviendra dès que l’app sera disponible au téléchargement.</p>
    </RulesPage>
  );
}
