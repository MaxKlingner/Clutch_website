import RulesPage from "@/components/site/RulesPage";

export default function Page() {
  return (
    <RulesPage title="Confidentialité">
      <p>Clutch garde ce qui sert à faire fonctionner le site et l’application.</p>
      <p>
        Le compte contient le nom, l’e-mail, la date de naissance, le téléphone, l’adresse et la photo. L’annonce contient les textes, le diplôme, la commune et les matières. Les conversations, les avis, les réponses et les signalements sont aussi enregistrés.
      </p>
      <p>
        Ces informations servent à afficher les professeurs, à envoyer les messages, à calculer une note et un délai de réponse, et à lire un signalement. Elles ne sont pas vendues.
      </p>
      <p>
        La connexion utilise un cookie pour te reconnaître. Il n’y a pas de publicité basée sur ta navigation.
      </p>
      <p>Tu peux supprimer ton compte depuis la page Compte. Cela retire l’accès à Clutch.</p>
      <p>Pour une question sur ces données, utilise le bouton Signaler sur un profil ou dans une conversation.</p>
    </RulesPage>
  );
}
