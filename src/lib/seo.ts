import type { Review, Tutor } from "@/lib/db";
import { resolveLocationQuery } from "@/lib/locations";
import { SITE_URL } from "@/lib/site";

export type FaqItem = {
  question: string;
  answer: string;
};

export type SubjectSeo = {
  slug: string;
  name: string;
  headline: string;
  title: string;
  description: string;
  intro: string;
  topics: string[];
  faq: FaqItem[];
};

export type CitySeo = {
  slug: string;
  name: string;
  region: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  headline: string;
  title: string;
  description: string;
  intro: string;
  faq: FaqItem[];
};

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function makeSubjectSeo(config: {
  name: string;
  article: string;
  introFocus: string;
  topics: string[];
  faq?: FaqItem[];
}): SubjectSeo {
  const slug = slugify(config.name);
  const lower = config.name.toLowerCase();
  const title = `Cours particuliers ${config.article}${config.name} en Belgique`;
  return {
    slug,
    name: config.name,
    headline: `Cours particuliers ${config.article}${config.name}`,
    title,
    description: `Trouvez un professeur particulier ${config.article}${lower} en Belgique ou à distance sur Clutch. Tarifs transparents, avis vérifiés et mise en relation 100 % gratuite sans commission.`,
    intro: `Besoin d’un professeur particulier ${config.article}${lower} ? Sur Clutch, comparez directement les profils en Belgique et à distance, consultez les tarifs horaires et contactez gratuitement le professeur idéal, sans abonnement ni commission. ${config.introFocus}`,
    topics: config.topics,
    faq: config.faq ?? [
      {
        question: `Combien coûte un cours particulier ${config.article}${lower} sur Clutch ?`,
        answer: `Chaque professeur fixe librement son tarif horaire sur son profil. Clutch ne prend aucune commission ni frais d’inscription sur les cours.`,
      },
      {
        question: `Les cours ${config.article}${lower} sont-ils proposés en présentiel ou à distance ?`,
        answer: `Selon les préférences de chaque professeur, les séances ont lieu chez le professeur, chez l’élève en Belgique ou en visioconférence à distance.`,
      },
    ],
  };
}

export const SUBJECT_PAGES: SubjectSeo[] = [
  makeSubjectSeo({
    name: "Mathématiques",
    article: "de ",
    introFocus:
      "Idéal pour consolider les bases en primaire, réussir le CE1D ou le CESS en secondaire, ou préparer les examens du supérieur et d’entrée en ingénieur ou médecine.",
    topics: ["Algèbre et équations", "Analyse et fonctions", "Géométrie et trigonométrie", "Statistiques et probabilités", "Préparation CE1D / CESS", "Examens d’entrée & université"],
  }),
  makeSubjectSeo({
    name: "Français",
    article: "de ",
    introFocus:
      "Accompagnement personnalisé pour l’orthographe, l’expression écrite, l’analyse de textes, la méthodologie de dissertation et la préparation du CEB, CE1D ou CESS.",
    topics: ["Orthographe et grammaire", "Compréhension à la lecture", "Rédaction et synthèse", "Commentaire littéraire", "Préparation orale et TFE"],
  }),
  makeSubjectSeo({
    name: "Néerlandais",
    article: "de ",
    introFocus:
      "Progressez à l’oral et à l’écrit avec des professeurs habitués aux exigences scolaires et universitaires en Belgique ainsi qu’aux entretiens professionnels.",
    topics: ["Conversation et prononciation", "Grammaire et conjugaison", "Vocabulaire scolaire et pro", "Remédiation primaire & secondaire", "Préparation examens bilingues"],
  }),
  makeSubjectSeo({
    name: "Anglais",
    article: "d’",
    introFocus:
      "Cours sur mesure pour gagner en aisance à l’oral, maîtriser la grammaire, préparer un examen universitaire, un test IELTS/TOEFL ou un entretien professionnel.",
    topics: ["Expression et compréhension orale", "Grammaire et syntaxe", "Anglais académique et business", "Préparation examens & certifications"],
  }),
  makeSubjectSeo({
    name: "Physique",
    article: "de ",
    introFocus:
      "Clarifiez les lois fondamentales grâce à une approche concrète par les exercices, adaptée au secondaire, aux hautes écoles et aux études scientifiques ou médicales.",
    topics: ["Mécanique et cinématique", "Électricité et magnétisme", "Optique et ondes", "Thermodynamique", "Exercices type examens d’entrée"],
  }),
  makeSubjectSeo({
    name: "Chimie",
    article: "de ",
    introFocus:
      "Maîtrisez la stœchiométrie, les réactions acide-base, l’oxydoréduction et la chimie organique avec des explications pas à pas et des exercices ciblés.",
    topics: ["Tableau périodique et liaisons", "Stœchiométrie et solutions", "Acides, bases et équilibres", "Chimie organique", "Préparation médecine & sciences"],
  }),
  makeSubjectSeo({
    name: "Biologie",
    article: "de ",
    introFocus:
      "Comprenez la biologie cellulaire, la génétique et la physiologie avec des schémas clairs et une méthode efficace pour retenir l’essentiel.",
    topics: ["Biologie cellulaire et moléculaire", "Génétique et évolution", "Anatomie et physiologie", "Écologie et sciences du vivant"],
  }),
  makeSubjectSeo({
    name: "Sciences",
    article: "de ",
    introFocus:
      "Un accompagnement global en physique, chimie et biologie pour réussir le CE1D, renforcer sa moyenne en secondaire ou reprendre confiance en laboratoire.",
    topics: ["Sciences générales (1er et 2e degré)", "Préparation CE1D sciences", "Méthode expérimentale", "Physique, chimie et biologie appliquées"],
  }),
  makeSubjectSeo({
    name: "Informatique",
    article: "d’",
    introFocus:
      "Apprenez la programmation, l’algorithmique, les bases de données ou la bureautique avec des étudiants en informatique, ingénieurs et développeurs.",
    topics: ["Python, Java, C et JavaScript", "Algorithmique et structures de données", "Développement web", "SQL et bases de données", "Bureautique et Excel"],
  }),
  makeSubjectSeo({
    name: "Économie",
    article: "d’",
    introFocus:
      "Comprenez les mécanismes microéconomiques et macroéconomiques avec des graphiques clairs et des résolutions d’examens types du secondaire ou de l’université.",
    topics: ["Microéconomie et marchés", "Macroéconomie", "Analyse graphique et modèles", "Économie appliquée & gestion"],
  }),
  makeSubjectSeo({
    name: "Comptabilité",
    article: "de ",
    introFocus:
      "Maîtrisez le plan comptable belge, les écritures de fin d’exercice, les bilans et comptes de résultats pour réussir vos examens de gestion ou de bachelier.",
    topics: ["Plan comptable belge (PCMN)", "Écritures d’achat, vente et TVA", "Amortissements et régularisations", "Analyse du bilan et du compte de résultats"],
  }),
  makeSubjectSeo({
    name: "Espagnol",
    article: "d’",
    introFocus:
      "Pratiquez l’espagnol à l’oral comme à l’écrit pour réussir vos cours de langue, préparer un Erasmus ou communiquer avec fluidité.",
    topics: ["Conversation et compréhension", "Temps du passé et subjonctif", "Vocabulaire du quotidien", "Préparation examens scolaires et DELE"],
  }),
  makeSubjectSeo({
    name: "Allemand",
    article: "d’",
    introFocus:
      "Apprivoisez les déclinaisons, la structure de phrase et l’oral grâce à un suivi régulier et adapté à votre niveau.",
    topics: ["Déclinaisons et syntaxe", "Expression orale et écoute", "Rédaction et vocabulaire", "Soutien secondaire et supérieur"],
  }),
  makeSubjectSeo({
    name: "Histoire",
    article: "d’",
    introFocus:
      "Apprenez à structurer une synthèse historique, analyser des sources critiques et mémoriser les repères chronologiques clés.",
    topics: ["Critique de sources", "Synthèses et repères chronologiques", "Histoire contemporaine et européenne", "Préparation CESS et supérieur"],
  }),
  makeSubjectSeo({
    name: "Géographie",
    article: "de ",
    introFocus:
      "Travaillez la lecture de cartes, l’analyse spatiale et les grands enjeux environnementaux et territoriaux avec des explications concrètes.",
    topics: ["Analyse spatiale et cartographie", "Géographie physique et humaine", "Aménagement du territoire", "Méthode pour travaux et examens"],
  }),
  makeSubjectSeo({
    name: "Latin",
    article: "de ",
    introFocus:
      "Consolidez vos déclinaisons, votre vocabulaire de base et votre méthode de version latine grâce à des exercices guidés et rigoureux.",
    topics: ["Déclinaisons et conjugaisons", "Analyse grammaticale", "Méthode de traduction et version", "Civilisation romaine"],
  }),
  makeSubjectSeo({
    name: "Méthodologie",
    article: "de ",
    introFocus:
      "Apprenez à organiser votre blocus, résumer efficacement vos cours, gérer votre temps et aborder vos examens avec sérénité.",
    topics: ["Planning de révisions et blocus", "Prise de notes et synthèses", "Cartes mentales et mémorisation", "Préparation mentale aux examens"],
  }),
];

function makeCitySeo(config: {
  name: string;
  region: string;
  fallbackPostal: string;
  fallbackLat: number;
  fallbackLng: number;
  introFocus: string;
}): CitySeo {
  const resolved = resolveLocationQuery(config.name);
  const slug = slugify(config.name);
  return {
    slug,
    name: config.name,
    region: config.region,
    postalCode: resolved?.postalCode ?? config.fallbackPostal,
    latitude: resolved?.latitude ?? config.fallbackLat,
    longitude: resolved?.longitude ?? config.fallbackLng,
    headline: `Professeurs particuliers à ${config.name}`,
    title: `Cours particuliers à ${config.name} — Professeurs gratuits sans commission`,
    description: `Trouvez un professeur particulier à ${config.name} (${config.region}) ou à distance sur Clutch. Maths, sciences, langues et méthode, avec mise en relation 100 % gratuite.`,
    intro: `Vous cherchez des cours particuliers à ${config.name} ou en ${config.region} ? Découvrez les professeurs disponibles autour de ${config.name} (chez le professeur ou chez l’élève) ainsi que les professeurs disponibles en visioconférence à distance, sans frais d’inscription ni commission. ${config.introFocus}`,
    faq: [
      {
        question: `Comment trouver un professeur particulier à ${config.name} ?`,
        answer: `Parcourez les profils ci-dessus classés autour de ${config.name} (${resolved?.postalCode ?? config.fallbackPostal}), comparez leurs matières, formats et tarifs, puis envoyez un message gratuitement.`,
      },
      {
        question: `Y a-t-il des frais ou une commission sur Clutch à ${config.name} ?`,
        answer: `Non. La mise en relation sur Clutch est entièrement gratuite pour les parents, élèves et professeurs, sans abonnement ni commission sur les cours.`,
      },
    ],
  };
}

export const CITY_PAGES: CitySeo[] = [
  makeCitySeo({
    name: "Bruxelles",
    region: "Région de Bruxelles-Capitale",
    fallbackPostal: "1000",
    fallbackLat: 50.84656,
    fallbackLng: 4.3517,
    introFocus:
      "Un large choix de professeurs étudiants et diplômés dans les 19 communes bruxelloises (Ixelles, Uccle, Woluwe, Etterbeek, Schaerbeek, Bruxelles-Ville…) pour tous les niveaux.",
  }),
  makeCitySeo({
    name: "Louvain-la-Neuve",
    region: "Brabant wallon",
    fallbackPostal: "1348",
    fallbackLat: 50.67417,
    fallbackLng: 4.61416,
    introFocus:
      "Au cœur du pôle universitaire du Brabant wallon, idéal pour les cours de mathématiques, physique, chimie, économie ou méthodologie.",
  }),
  makeCitySeo({
    name: "Liège",
    region: "Province de Liège",
    fallbackPostal: "4000",
    fallbackLat: 50.64514,
    fallbackLng: 5.57342,
    introFocus:
      "Des professeurs disponibles au centre de Liège et dans l’agglomération liégeoise pour le soutien scolaire, le secondaire et l’université.",
  }),
  makeCitySeo({
    name: "Namur",
    region: "Province de Namur",
    fallbackPostal: "5000",
    fallbackLat: 50.4562,
    fallbackLng: 4.84931,
    introFocus:
      "Trouvez un accompagnement adapté à Namur, Jambes et environs pour progresser tout au long de l’année ou préparer les examens.",
  }),
  makeCitySeo({
    name: "Charleroi",
    region: "Hainaut",
    fallbackPostal: "6000",
    fallbackLat: 50.41571,
    fallbackLng: 4.44916,
    introFocus:
      "Des cours particuliers accessibles à Charleroi et dans sa région, chez le professeur, à domicile ou à distance.",
  }),
  makeCitySeo({
    name: "Mons",
    region: "Hainaut",
    fallbackPostal: "7000",
    fallbackLat: 50.45496,
    fallbackLng: 3.95196,
    introFocus:
      "Soutien scolaire, remédiation et préparation d’examens avec des professeurs proches de Mons et à distance.",
  }),
  makeCitySeo({
    name: "Wavre",
    region: "Brabant wallon",
    fallbackPostal: "1300",
    fallbackLat: 50.71642,
    fallbackLng: 4.60774,
    introFocus:
      "Proche de Louvain-la-Neuve et du centre du Brabant wallon, idéal pour les cours en présentiel à domicile ou chez le professeur.",
  }),
  makeCitySeo({
    name: "Nivelles",
    region: "Brabant wallon",
    fallbackPostal: "1400",
    fallbackLat: 50.58916,
    fallbackLng: 4.33191,
    introFocus:
      "Accompagnement sur mesure en primaire, secondaire et supérieur dans la région de Nivelles et du Brabant wallon ouest.",
  }),
  makeCitySeo({
    name: "Waterloo",
    region: "Brabant wallon",
    fallbackPostal: "1410",
    fallbackLat: 50.71736,
    fallbackLng: 4.3978,
    introFocus:
      "Professeurs de langues, sciences et mathématiques proches de Waterloo, Braine-l’Alleud et Rhode-Saint-Genèse.",
  }),
  makeCitySeo({
    name: "Grez-Doiceau",
    region: "Brabant wallon",
    fallbackPostal: "1390",
    fallbackLat: 50.73862,
    fallbackLng: 4.69623,
    introFocus:
      "Des cours particuliers de proximité à Grez-Doiceau, Wavre, Chaumont-Gistoux et dans tout l’est du Brabant wallon.",
  }),
  makeCitySeo({
    name: "Tournai",
    region: "Wallonie picarde",
    fallbackPostal: "7500",
    fallbackLat: 50.60566,
    fallbackLng: 3.38783,
    introFocus:
      "Comparez les professeurs disponibles près de Tournai ou en ligne pour un suivi régulier dans toutes les matières.",
  }),
  makeCitySeo({
    name: "Arlon",
    region: "Province de Luxembourg",
    fallbackPostal: "6700",
    fallbackLat: 49.68276,
    fallbackLng: 5.81192,
    introFocus:
      "Trouvez facilement un professeur près d’Arlon ou à distance en visioconférence pour le soutien scolaire et les langues.",
  }),
];

export const HOME_FAQ: FaqItem[] = [
  {
    question: "Clutch est-il vraiment gratuit pour les élèves et les professeurs ?",
    answer:
      "Oui. Contrairement aux plateformes classiques, Clutch ne facture aucun frais de mise en relation, aucun abonnement élève et aucune commission sur les cours. Vous voyez le tarif du professeur directement et vous réglez avec lui en dehors du site.",
  },
  {
    question: "Comment contacter un professeur particulier sur Clutch ?",
    answer:
      "Parcourez les profils par matière, ville, format ou tarif, puis cliquez sur le professeur qui vous convient pour lui envoyer un message directement depuis sa fiche (ou voir son téléphone si vous êtes connecté).",
  },
  {
    question: "Où ont lieu les cours particuliers ?",
    answer:
      "Chaque professeur indique clairement ses formats sur sa fiche : chez le professeur, chez l’élève (à domicile) ou à distance en visioconférence.",
  },
  {
    question: "Qui peut publier une annonce de cours particuliers sur Clutch ?",
    answer:
      "Tout étudiant ou professeur particulier majeur souhaitant donner des cours en Belgique ou à distance peut publier son annonce gratuitement en quelques minutes.",
  },
];

export function getSubjectBySlug(slug: string): SubjectSeo | undefined {
  return SUBJECT_PAGES.find((item) => item.slug === slug);
}

export function getSubjectByName(name: string): SubjectSeo | undefined {
  const slug = slugify(name);
  return SUBJECT_PAGES.find((item) => item.slug === slug);
}

export function getCityBySlug(slug: string): CitySeo | undefined {
  return CITY_PAGES.find((item) => item.slug === slug);
}

export function getCityByName(name: string): CitySeo | undefined {
  const slug = slugify(name);
  return CITY_PAGES.find((item) => item.slug === slug);
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Clutch",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    email: "hello@clutch.education",
    description:
      "Plateforme gratuite de mise en relation pour trouver un professeur particulier en Belgique et à distance, sans commission ni abonnement.",
    areaServed: {
      "@type": "Country",
      name: "Belgique",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Grez-Doiceau",
      postalCode: "1390",
      addressCountry: "BE",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Clutch",
    url: SITE_URL,
    inLanguage: "fr-BE",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/professeurs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function tutorListJsonLd(tutors: Tutor[], url: string, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: url.startsWith("http") ? url : `${SITE_URL}${url}`,
    numberOfItems: tutors.length,
    itemListElement: tutors.slice(0, 24).map((tutor, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/tuteur/${tutor.id}`,
      name: `${tutor.name.split(/\s+/)[0] || "Professeur"} — ${tutor.specialties[0] || tutor.subject}`,
    })),
  };
}

export function tutorJsonLd(tutor: Tutor, reviews: Review[]) {
  const first = tutor.name.trim().split(/\s+/)[0] || "Professeur";
  const url = `${SITE_URL}/tuteur/${tutor.id}`;
  const subjects = tutor.specialties.length ? tutor.specialties : [tutor.subject];
  const service: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Cours particuliers de ${subjects[0] || "soutien scolaire"} avec ${first}`,
    url,
    description:
      tutor.bio.trim() ||
      `Cours particuliers de ${subjects.join(", ")}${tutor.city ? ` à ${tutor.city}` : ""}.`,
    serviceType: `Cours particuliers (${subjects.join(", ")})`,
    provider: {
      "@type": "Person",
      name: first,
      url,
      ...(tutor.avatarUrl ? { image: tutor.avatarUrl } : {}),
      knowsAbout: subjects,
    },
    areaServed: tutor.city
      ? {
          "@type": "City",
          name: tutor.city,
        }
      : {
          "@type": "Country",
          name: "Belgique",
        },
    offers: {
      "@type": "Offer",
      price: tutor.hourlyRate,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url,
    },
  };

  if (tutor.reviewCount > 0 && tutor.rating > 0) {
    service.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(tutor.rating.toFixed(1)),
      reviewCount: tutor.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (reviews.length > 0) {
    service.review = reviews.slice(0, 10).map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment,
      datePublished: review.createdAt ? review.createdAt.slice(0, 10) : undefined,
      author: {
        "@type": "Person",
        name: "Élève Clutch",
      },
    }));
  }

  return service;
}
