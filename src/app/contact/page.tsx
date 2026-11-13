import type { Metadata } from "next";
import RulesPage from "@/components/site/RulesPage";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Une question sur Clutch, un profil de professeur ou un signalement ? Contactez l’équipe Clutch directement.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <RulesPage title="Contact">
      <p>Une question sur Clutch, un compte ou un signalement ?</p>
      <p>
        Écris-nous à{" "}
        <a href="mailto:max.r.klingner@gmail.com" className="font-semibold text-[#0d9f7a] underline">
          max.r.klingner@gmail.com
        </a>
        .
      </p>
      <p>
        Sur le site, tu peux aussi signaler un profil ou une conversation depuis la fiche ou les
        messages.
      </p>
    </RulesPage>
  );
}
