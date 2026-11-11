-- Wipe existing data and insert 20 complete stress-test tutor profiles
DELETE FROM public.reports;
DELETE FROM public.favorite_tutors;
DELETE FROM public.reviews;
DELETE FROM public.messages;
DELETE FROM public.matches;
DELETE FROM public.response_samples;
DELETE FROM public.email_consents;
DELETE FROM public.profiles;
DELETE FROM public.user_profiles;

INSERT INTO public.user_profiles (clerk_id, first_name, last_name, full_name, city, role, active_role)
VALUES
  ('seed_parent_1', 'Sophie', 'Durand', 'Sophie Durand', 'Wavre', 'parent', 'parent'),
  ('seed_parent_2', 'Thomas', 'Meunier', 'Thomas Meunier', 'Bruxelles', 'parent', 'parent'),
  ('seed_parent_3', 'Claire', 'Bogaert', 'Claire Bogaert', 'Ixelles', 'parent', 'parent'),
  ('seed_parent_4', 'Mehdi', 'Bensaid', 'Mehdi Bensaid', 'Namur', 'parent', 'parent'),
  ('seed_parent_5', 'Julie', 'Lefèvre', 'Julie Lefèvre', 'Liège', 'parent', 'parent');

DO $$
DECLARE
  v_tutor_id uuid;
  v_match_id uuid;
BEGIN

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Éléonore Van Der Berghe-De Vries', 'Mathématiques, Français, Sciences, Anglais, Informatique, Économie', 45, 0, 0, 'tutor',
    'Docteure en pédagogie scientifique j’accompagne du primaire au master en mathématiques physique économie programmation rédaction anglais avec méthode structurée bilan complet et suivi régulier.', 'Diplômée avec la plus grande distinction à Louvain-la-Neuve, j’enseigne depuis huit ans auprès d’élèves du primaire, du secondaire supérieur, d’étudiants universitaires en ingénierie ou gestion ainsi que d’adultes en reprise d’études. Chaque année, j’adapte mes supports aux nouveaux référentiels belges pour débloquer les notions complexes, renforcer l’autonomie et redonner confiance avant les examens importants, sessions de juin, jurys centraux ou concours d’entrée exigeants sans jamais négliger le rythme individuel de chaque apprenant motivé.', 'Nous démarrons toujours par un diagnostic rapide de quinze minutes afin de cibler précisément les blocages accumulés. Ensuite, nous alternons rappels de cours synthétiques, démonstrations concrètes étape par étape et exercices progressifs calibrés selon le niveau visé. En fin de séance, tu repars avec une fiche mémo personnalisée, des exercices ciblés à travailler sereinement entre deux rendez-vous et une correction détaillée pour mesurer tes progrès réels semaine après semaine jusqu’à ton objectif.', ARRAY['Mathématiques', 'Français', 'Sciences', 'Anglais', 'Informatique', 'Économie']::text[], 'https://i.pravatar.cc/400?img=32',
    'Ottignies-Louvain-La-Neuve', '1340', 50.67267, 4.58049,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['Primaire', 'Secondaire', 'Supérieur', 'Formation pour adultes']::text[],
    'Master en sciences mathématiques à finalité didactique et agrégation', 'Université catholique de Louvain (UCLouvain)', 2022,
    15, '+32 470 11 22 33', now() - interval '480 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '9 days', 'seed_parent_1', now() - interval '12 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '12 days'),
    (v_match_id, 'seed_tutor_1', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '11 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Grâce aux fiches mémo et au suivi avant le blocus en ingénieur civil, j’ai réussi analyse et algèbre du premier coup.',
    'Merci beaucoup Thomas, ton travail régulier entre chaque séance a fait toute la différence !',
    now() - interval '8 days',
    now() - interval '9 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_2', v_tutor_id, 'accepted', now() - interval '18 days', 'seed_parent_2', now() - interval '21 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_2', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '21 days'),
    (v_match_id, 'seed_tutor_1', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '20 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_2',
    v_tutor_id,
    5,
    'Explications extrêmement claires même sur des notions très abstraites en économétrie et statistiques universitaires.',
    NULL,
    NULL,
    now() - interval '18 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_3', v_tutor_id, 'accepted', now() - interval '27 days', 'seed_parent_3', now() - interval '30 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_3', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '30 days'),
    (v_match_id, 'seed_tutor_1', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '29 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_3',
    v_tutor_id,
    4,
    'Très structurée et ponctuelle. Beaucoup d’exercices pratiques adaptés au programme de 6e secondaire.',
    'Avec plaisir ! Bon succès pour la suite des études.',
    now() - interval '26 days',
    now() - interval '27 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_4', v_tutor_id, 'accepted', now() - interval '36 days', 'seed_parent_4', now() - interval '39 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_4', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '39 days'),
    (v_match_id, 'seed_tutor_1', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '38 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_4',
    v_tutor_id,
    3,
    'Cours très dense et exigeant, demande pas mal de travail personnel mais résultats solides à l’examen.',
    'Merci pour ce retour franc, j’adapte toujours le rythme selon les retours !',
    now() - interval '35 days',
    now() - interval '36 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_5', v_tutor_id, 'accepted', now() - interval '45 days', 'seed_parent_5', now() - interval '48 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_5', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '48 days'),
    (v_match_id, 'seed_tutor_1', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '47 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_5',
    v_tutor_id,
    5,
    'Un encadrement rare : prépare vraiment sur mesure et répond même rapidement entre deux cours.',
    NULL,
    NULL,
    now() - interval '45 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Zoé Li', 'Mathématiques', 5, 0, 0, 'tutor',
    'Institutrice primaire à Bruxelles, cours ludiques de calcul mental, fractions et géométrie dès 5 €/h.', 'Jeune diplômée en enseignement primaire à Bruxelles, je propose des heures de soutien accessibles à prix solidaire pour aider les enfants à aimer les chiffres sans stress.', 'Jeux de manipulation, petits défis chronométrés sans pression et vérification douce des devoirs du jour.', ARRAY['Mathématiques']::text[], 'https://i.pravatar.cc/400?img=45',
    'Bruxelles', '1000', 50.84656, 4.3517,
    ARRAY['Face à face']::text[], ARRAY['Primaire']::text[],
    'Bachelier instituteur primaire', 'Haute École Francisco Ferrer', 2025,
    NULL, NULL, now() - interval '456 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Jean-Baptiste Van Der Linden', 'Économie, Mathématiques, Informatique', 150, 0, 0, 'tutor',
    'Professeur chercheur pour prépas grandes écoles, thèses quantitatives, Python financier et examens Solvay.', 'Vingt-cinq ans d’expérience académique et de conseil en modélisation stochastique. J’encadre exclusivement des étudiants en bachelier ou master exigeants, doctorants et cadres en reconversion financière.', 'Relecture préalable de tes syllabus et jeux de données, résolution en direct sur tableau partagé et scripts reproductibles commentés en Python ou R.', ARRAY['Économie', 'Mathématiques', 'Informatique']::text[], 'https://i.pravatar.cc/400?img=11',
    'Woluwe-Saint-Pierre', '1150', 50.82924, 4.4433,
    ARRAY['À distance']::text[], ARRAY['Supérieur', 'Formation pour adultes']::text[],
    'PhD en finance quantitative et ingénieur de gestion', 'Solvay Brussels School (ULB)', 1998,
    35, '+32 2 555 89 10', now() - interval '432 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '11 days', 'seed_parent_1', now() - interval '14 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '14 days'),
    (v_match_id, 'seed_tutor_3', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '13 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Un accompagnement exceptionnel pour mon mémoire de master en finance quantitative et simulations Monte-Carlo.',
    'Félicitations pour la mention très bien à ta soutenance !',
    now() - interval '10 days',
    now() - interval '11 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_2', v_tutor_id, 'accepted', now() - interval '20 days', 'seed_parent_2', now() - interval '23 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_2', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '23 days'),
    (v_match_id, 'seed_tutor_3', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '22 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_2',
    v_tutor_id,
    5,
    'Tarif élevé mais précision chirurgicale en microéconomie avancée, chaque minute est rentable.',
    NULL,
    NULL,
    now() - interval '20 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_3', v_tutor_id, 'accepted', now() - interval '29 days', 'seed_parent_3', now() - interval '32 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_3', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '32 days'),
    (v_match_id, 'seed_tutor_3', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '31 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_3',
    v_tutor_id,
    4,
    'Très pointu techniquement, parfait pour préparer les partiels de deuxième master.',
    NULL,
    NULL,
    now() - interval '29 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_4', v_tutor_id, 'accepted', now() - interval '38 days', 'seed_parent_4', now() - interval '41 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_4', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '41 days'),
    (v_match_id, 'seed_tutor_3', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '40 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_4',
    v_tutor_id,
    5,
    'M’a débloqué en deux séances sur mes modèles économétriques en R.',
    'Ravi d’avoir pu t’aider dans la dernière ligne droite !',
    now() - interval '37 days',
    now() - interval '38 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Sébastien N’Diaye', 'Sciences, Mathématiques', 32, 0, 0, 'tutor',
    'Physicien pédagogue à Mont-Saint-Guibert pour réussir les trois premières années du secondaire en sciences.', 'Passionné par la vulgarisation scientifique, j’aide les jeunes du 1er et 2e degré secondaire à comprendre plutôt qu’à réciter par cœur leurs formules.', 'Expériences visuelles simples, schémas en couleurs et fiches d’exercices graduées du niveau CE1D jusqu’aux interrogations surprises.', ARRAY['Sciences', 'Mathématiques']::text[], 'https://i.pravatar.cc/400?img=12',
    'Mont-Saint-Guibert', '1435', 50.63656, 4.6127,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['1ère secondaire', '2ème secondaire', '3ème secondaire']::text[],
    'Master en sciences physiques', 'Université de Namur (UNamur)', 2021,
    12, '+32 472 33 44 55', now() - interval '408 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '12 days', 'seed_parent_1', now() - interval '15 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '15 days'),
    (v_match_id, 'seed_tutor_4', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '14 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Mon fils a repris 5 points de moyenne en sciences entre Noël et Pâques. Très patient !',
    'Merci beaucoup, il pose d’excellentes questions pendant les séances !',
    now() - interval '11 days',
    now() - interval '12 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_2', v_tutor_id, 'accepted', now() - interval '21 days', 'seed_parent_2', now() - interval '24 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_2', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '24 days'),
    (v_match_id, 'seed_tutor_4', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '23 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_2',
    v_tutor_id,
    5,
    'Explique calmement les bases d’algèbre et d’électricité sans jamais juger.',
    NULL,
    NULL,
    now() - interval '21 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_3', v_tutor_id, 'accepted', now() - interval '30 days', 'seed_parent_3', now() - interval '33 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_3', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '33 days'),
    (v_match_id, 'seed_tutor_4', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '32 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_3',
    v_tutor_id,
    5,
    'Réponse ultra rapide sur le site et premier cours la semaine suivante.',
    NULL,
    NULL,
    now() - interval '30 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Marie-Claire De Smet-Dubois', 'Français, Anglais', 30, 0, 0, 'tutor',
    'Professeure certifiée de français et anglais à Braine-l’Alleud, orthographe, dissertations, CESS et prise de parole.', 'Titulaire d’un master en philologie et d’une agrégation, j’accompagne lycéens et adultes en difficulté rédactionnelle ou préparant un entretien professionnel bilingue.', 'Analyse de textes authentiques, structuration de plans détaillés et coaching oral en situation réelle avec retours écrits immédiats.', ARRAY['Français', 'Anglais']::text[], 'https://i.pravatar.cc/400?img=20',
    'Braine-L''alleud', '1420', 50.69409, 4.35481,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['Secondaire', 'Formation pour adultes']::text[],
    'Master en langues et lettres françaises et romanes', 'Université libre de Bruxelles (ULB)', 2014,
    180, '+32 495 44 55 66', now() - interval '384 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '13 days', 'seed_parent_1', now() - interval '16 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '16 days'),
    (v_match_id, 'seed_tutor_5', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '15 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Préparation remarquable pour l’oral de français et l’essai argumentatif en 6e secondaire.',
    'Bravo pour ton 17/20 !',
    now() - interval '12 days',
    now() - interval '13 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_2', v_tutor_id, 'accepted', now() - interval '22 days', 'seed_parent_2', now() - interval '25 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_2', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '25 days'),
    (v_match_id, 'seed_tutor_5', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '24 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_2',
    v_tutor_id,
    5,
    'M’a aidé à gagner en fluidité en anglais professionnel avant ma prise de poste.',
    NULL,
    NULL,
    now() - interval '22 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Gaël Vanderhaeghen', 'Informatique', 55, 0, 0, 'tutor',
    'Développeur full-stack et tuteur Python, TypeScript, SQL, algorithmes et projets informatiques en visio.', 'Ingénieur logiciel senior depuis 6 ans, j’accompagne les étudiants en bachelier informatique et personnes en reconversion sur des cas concrets.', 'Partage d’écran, débogage guidé sur ton vrai dépôt Git, revue de code et préparation pratique aux examens de programmation.', ARRAY['Informatique']::text[], 'https://i.pravatar.cc/400?img=53',
    'Grez-Doiceau', '1390', 50.73862, 4.69623,
    ARRAY['À distance']::text[], ARRAY['Supérieur', 'Formation pour adultes']::text[],
    'Master en sciences informatiques', 'UCLouvain', 2020,
    45, '+32 478 90 12 34', now() - interval '360 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Camille Verhoeven', 'Anglais, Français', 25, 0, 0, 'tutor',
    'Traductrice bilingue à Bruxelles centre, remise à niveau en anglais scolaire et expression écrite.', 'Passionnée de linguistique, j’aide les élèves bloqués à l’oral à oser parler anglais dès la première séance dans une ambiance bienveillante.', 'Moitié discussion guidée sur des sujets du quotidien, moitié grammaire ciblée appliquée directement aux chapitres vus en classe.', ARRAY['Anglais', 'Français']::text[], 'https://i.pravatar.cc/400?img=5',
    'Bruxelles', '1000', 50.84656, 4.3517,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['Primaire', 'Secondaire']::text[],
    'Master en traduction et interprétation', 'ISTI - ULB', 2023,
    90, NULL, now() - interval '336 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '15 days', 'seed_parent_1', now() - interval '18 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '18 days'),
    (v_match_id, 'seed_tutor_7', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '17 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    4,
    'Très sympa et met tout de suite à l’aise à l’oral.',
    'Merci ! Continue comme ça !',
    now() - interval '14 days',
    now() - interval '15 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Maëlys Janssens', 'Sciences, Français', 28, 0, 0, 'tutor',
    'Étudiante chercheuse à Ixelles, cours de biologie, chimie et méthodologie pour le secondaire.', 'Habituée à vulgariser la biologie cellulaire et la chimie organique auprès de lycéens de Bruxelles, j’insiste sur la méthode de prise de notes.', 'Reprise des schémas du cours, création de cartes mentales et entraînement sur d’anciens questionnaires d’examens.', ARRAY['Sciences', 'Français']::text[], 'https://i.pravatar.cc/400?img=9',
    'Ixelles', '1050', 50.82229, 4.38157,
    ARRAY['Face à face']::text[], ARRAY['Secondaire']::text[],
    'Master en biologie des organismes et écologie', 'ULB', 2024,
    25, '+32 486 77 11 02', now() - interval '312 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '16 days', 'seed_parent_1', now() - interval '19 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '19 days'),
    (v_match_id, 'seed_tutor_8', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '18 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Grâce aux cartes mentales en bio et chimie, ma fille a enfin compris ses synthèses.',
    NULL,
    NULL,
    now() - interval '16 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_2', v_tutor_id, 'accepted', now() - interval '25 days', 'seed_parent_2', now() - interval '28 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_2', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '28 days'),
    (v_match_id, 'seed_tutor_8', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '27 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_2',
    v_tutor_id,
    5,
    'Ponctuelle, claire et super motivante près du cimetière d’Ixelles.',
    'Merci beaucoup !',
    now() - interval '24 days',
    now() - interval '25 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Lucas Peeters', 'Mathématiques, Informatique', 22, 0, 0, 'tutor',
    'Étudiant ingénieur civil à Etterbeek : maths 4h/6h/8h, physique mécanique et préparation examen d’entrée.', 'Ayant réussi l’examen d’admission en ingénieur civil haut la main, je partage les automatismes rapides de résolution qui font gagner des points.', 'Résolution active d’exercices types examen, astuces de calcul mental et checklist des erreurs classiques à éviter.', ARRAY['Mathématiques', 'Informatique']::text[], 'https://i.pravatar.cc/400?img=14',
    'Etterbeek', '1040', 50.83685, 4.38951,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['Secondaire', 'Supérieur']::text[],
    'Bachelier en sciences de l’ingénieur', 'École polytechnique de Bruxelles', 2025,
    480, NULL, now() - interval '288 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '17 days', 'seed_parent_1', now() - interval '20 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '20 days'),
    (v_match_id, 'seed_tutor_9', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '19 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    3,
    'Bon niveau en maths, parfois un peu rapide sur les étapes intermédiaires mais réexplique quand on demande.',
    'Merci pour le retour, je veille désormais à vérifier chaque étape !',
    now() - interval '16 days',
    now() - interval '17 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_2', v_tutor_id, 'accepted', now() - interval '26 days', 'seed_parent_2', now() - interval '29 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_2', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '29 days'),
    (v_match_id, 'seed_tutor_9', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '28 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_2',
    v_tutor_id,
    5,
    'Super préparation aux annales de l’examen d’entrée polytech.',
    NULL,
    NULL,
    now() - interval '26 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Inès El Amrani', 'Français, Mathématiques, Anglais', 18, 0, 0, 'tutor',
    'Professeure régente à Schaerbeek pour devoirs encadrés, méthode d’étude et CEB ou CE1D.', 'Régente en exercice dans un athénée bruxellois, je connais exactement les attentes des jurys CEB et CE1D ainsi que l’organisation des devoirs.', 'Relecture de l’agenda scolaire, planification des révisions sur deux semaines et exercices ciblés sans surcharge.', ARRAY['Français', 'Mathématiques', 'Anglais']::text[], 'https://i.pravatar.cc/400?img=47',
    'Schaerbeek', '1030', 50.8676, 4.37371,
    ARRAY['Face à face']::text[], ARRAY['Primaire', 'Secondaire']::text[],
    'Bachelier AESI français et morale', 'Haute École Galilée', 2023,
    2100, '+32 484 55 22 90', now() - interval '264 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '18 days', 'seed_parent_1', now() - interval '21 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '21 days'),
    (v_match_id, 'seed_tutor_10', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '20 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    4,
    'Très rassurante avec les plus jeunes pour le CEB, met de l’ordre dans le cartable et les cours.',
    NULL,
    NULL,
    now() - interval '18 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Hugo Claessens', 'Économie, Mathématiques', 65, 0, 0, 'tutor',
    'Économiste à Uccle, soutien en microéconomie, macroéconomie, comptabilité générale et mathématiques financières.', 'Chargé de travaux dirigés pendant quatre ans, j’aide les élèves de rhéto et étudiants de 1re bac à structurer leurs raisonnements chiffrés.', 'Cas pratiques issus de la presse économique belge, exercices graphiques et préparation rigoureuse aux QCM et questions ouvertes.', ARRAY['Économie', 'Mathématiques']::text[], 'https://i.pravatar.cc/400?img=15',
    'Uccle', '1180', 50.80182, 4.33723,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['5ème secondaire', '6ème secondaire', 'Supérieur']::text[],
    'Master en sciences économiques', 'UCLouvain Saint-Louis Bruxelles', 2018,
    55, '+32 475 66 77 88', now() - interval '240 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '19 days', 'seed_parent_1', now() - interval '22 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '22 days'),
    (v_match_id, 'seed_tutor_11', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '21 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Clair, méthodique et super disponible en période de blocus à Uccle.',
    NULL,
    NULL,
    now() - interval '19 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Chloé Vermeulen', 'Anglais, Économie', 35, 0, 0, 'tutor',
    'Consultante bilingue à Woluwe-Saint-Lambert : anglais business, IELTS, économie et préparation d’oraux.', 'Formée en cursus entièrement anglophone et forte de quatre années en cabinet de conseil, j’entraîne aux examens de langues et d’économie.', 'Simulations d’examens oraux, enrichissement du vocabulaire académique et rédaction structurée d’essais en anglais.', ARRAY['Anglais', 'Économie']::text[], 'https://i.pravatar.cc/400?img=44',
    'Woluwe-Saint-Lambert', '1200', 50.84669, 4.42848,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['Secondaire', 'Supérieur', 'Formation pour adultes']::text[],
    'Master en business engineering', 'Louvain School of Management', 2021,
    30, NULL, now() - interval '216 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '20 days', 'seed_parent_1', now() - interval '23 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '23 days'),
    (v_match_id, 'seed_tutor_12', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '22 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'J’ai obtenu 7.5 à l’IELTS après cinq séances ciblées avec Chloé.',
    'Félicitations pour ton score !',
    now() - interval '19 days',
    now() - interval '20 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Thomas Delacroix', 'Mathématiques, Sciences', 26, 0, 0, 'tutor',
    'Chimiste à Wavre : cours particuliers de chimie minérale, stœchiométrie, physique et maths secondaires.', 'Passionné par l’enseignement de terrain en Brabant wallon, je rends enfin accessibles les équations bilan, moles et vecteurs.', 'Découpage des problèmes en étapes simples et fiches récapitulatives à emporter chez soi.', ARRAY['Mathématiques', 'Sciences']::text[], 'https://i.pravatar.cc/400?img=8',
    'Wavre', '1300', 50.71642, 4.60774,
    ARRAY['Face à face']::text[], ARRAY['Secondaire']::text[],
    'Master en chimie', 'UCLouvain', 2019,
    110, '+32 477 88 99 00', now() - interval '192 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '21 days', 'seed_parent_1', now() - interval '24 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '24 days'),
    (v_match_id, 'seed_tutor_13', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '23 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Enfin quelqu’un qui rend la stœchiométrie limpide !',
    NULL,
    NULL,
    now() - interval '21 days'
  );

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_2', v_tutor_id, 'accepted', now() - interval '30 days', 'seed_parent_2', now() - interval '33 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_2', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '33 days'),
    (v_match_id, 'seed_tutor_13', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '32 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_2',
    v_tutor_id,
    4,
    'Très sérieux et patient.',
    NULL,
    NULL,
    now() - interval '30 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Noémie Vandenberghe', 'Français', 20, 0, 0, 'tutor',
    'Logopède à Ottignies, accompagnement lecture, dyslexie, orthographe et expression écrite avec douceur.', 'Spécialisée dans les troubles des apprentissages et la méthodologie de lecture, j’aide chaque enfant à retrouver le plaisir de lire.', 'Supports aérés, police adaptée, stratégies visuelles pour retenir l’orthographe sans punition.', ARRAY['Français']::text[], 'https://i.pravatar.cc/400?img=25',
    'Ottignies', '1340', 50.66636, 4.56905,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['Primaire', 'Secondaire']::text[],
    'Master en logopédie', 'Université de Liège (ULiège)', 2022,
    40, '+32 496 22 33 44', now() - interval '168 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '22 days', 'seed_parent_1', now() - interval '25 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '25 days'),
    (v_match_id, 'seed_tutor_14', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '24 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Une patience infinie et des outils adaptés pour les élèves dyslexiques.',
    'Merci beaucoup pour votre confiance !',
    now() - interval '21 days',
    now() - interval '22 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Maxime Lemaire', 'Informatique, Sciences, Mathématiques', 24, 0, 0, 'tutor',
    'Tuteur sur le campus de Louvain-la-Neuve en algorithmique, C, Java, Python et analyse mathématique.', 'Assistant étudiant en informatique à l’EPL depuis deux ans, je connais par cœur les cours de BAC1 et BAC2 et leurs pièges d’examen.', 'Travaux pratiques guidés sur tes énoncés réels, traçage mémoire pas à pas et entraînement sur d’anciens examens EPL.', ARRAY['Informatique', 'Sciences', 'Mathématiques']::text[], 'https://i.pravatar.cc/400?img=59',
    'Louvain-La-Neuve', '1348', 50.67417, 4.61416,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['Secondaire', 'Supérieur']::text[],
    'Master ingénieur civil en informatique', 'École polytechnique de Louvain', 2025,
    20, NULL, now() - interval '144 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '23 days', 'seed_parent_1', now() - interval '26 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '26 days'),
    (v_match_id, 'seed_tutor_15', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '25 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Indispensable pour réussir le cours de Python et structures de données en BAC1.',
    NULL,
    NULL,
    now() - interval '23 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Clara De Backer', 'Anglais, Français, Économie', 40, 0, 0, 'tutor',
    'Diplômée bilingue à Waterloo : coaching essais, anglais avancé, histoire et économie européenne.', 'Habituée aux cursus internationaux et bilingues autour de Waterloo, j’aide à rédiger des essais rigoureux et convaincants.', 'Méthode de rédaction universitaire, correction détaillée de tes textes avant remise et travail sur l’argumentation orale.', ARRAY['Anglais', 'Français', 'Économie']::text[], 'https://i.pravatar.cc/400?img=29',
    'Waterloo', '1410', 50.71736, 4.3978,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['Secondaire', 'Supérieur']::text[],
    'Master en sciences politiques et relations internationales', 'KU Leuven', 2020,
    280, '+32 471 10 20 30', now() - interval '120 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Antoine Mertens', 'Mathématiques, Sciences', 80, 0, 0, 'tutor',
    'Professeur du secondaire supérieur à Nivelles : physique, maths 6h/8h et préparation médecine.', 'Quinze années d’enseignement en athénée et préparation intensive à l’examen d’entrée en médecine et dentisterie.', 'Séquences intensives centrées sur les QCM chronométrés et la maîtrise rapide des calculs sans calculatrice.', ARRAY['Mathématiques', 'Sciences']::text[], 'https://i.pravatar.cc/400?img=60',
    'Nivelles', '1400', 50.58916, 4.33191,
    ARRAY['Face à face']::text[], ARRAY['Secondaire', 'Supérieur']::text[],
    'Agrégation et Master en physique fondamentale', 'ULB', 2009,
    60, '+32 497 80 70 60', now() - interval '96 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '25 days', 'seed_parent_1', now() - interval '28 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '28 days'),
    (v_match_id, 'seed_tutor_17', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '27 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Très professionnel, prépare redoutablement bien aux concours scientifiques.',
    NULL,
    NULL,
    now() - interval '25 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Sarah Goffin', 'Sciences, Français', 15, 0, 0, 'tutor',
    'Soutien scolaire bienveillant à Namur en biologie, chimie de base et français à tarif accessible.', 'À l’écoute des élèves qui manquent d’assurance, j’installe des routines simples pour réviser sans paniquer la veille des interros.', 'Relecture des synthèses, quiz flash oraux de dix minutes en fin de séance et fiche de suivi envoyée aux parents.', ARRAY['Sciences', 'Français']::text[], 'https://i.pravatar.cc/400?img=41',
    'Namur', '5000', 50.4562, 4.84931,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['Primaire', 'Secondaire']::text[],
    'Bachelier en agronomie et pédagogie', 'HEPN Namur', 2024,
    50, NULL, now() - interval '72 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '26 days', 'seed_parent_1', now() - interval '29 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '29 days'),
    (v_match_id, 'seed_tutor_18', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '28 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Adorable, patiente et ponctuelle sur Namur.',
    NULL,
    NULL,
    now() - interval '26 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Nicolas Simonis', 'Informatique, Économie', 30, 0, 0, 'tutor',
    'Diplômé HEC Liège : Excel avancé, VBA, SQL, Power BI, comptabilité et statistiques appliquées.', 'Analyste données en entreprise et formateur indépendant, j’accompagne étudiants HEC et professionnels souhaitant maîtriser Excel ou SQL.', 'Ateliers pratiques sur tes propres tableaux et bases de données pour automatiser et réussir tes examens.', ARRAY['Informatique', 'Économie']::text[], 'https://i.pravatar.cc/400?img=33',
    'Liège', '4000', 50.64514, 5.57342,
    ARRAY['À distance']::text[], ARRAY['Secondaire', 'Supérieur', 'Formation pour adultes']::text[],
    'Master ingénieur de gestion orientation analytics', 'HEC Liège', 2021,
    720, '+32 479 44 11 22', now() - interval '48 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '27 days', 'seed_parent_1', now() - interval '30 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '30 days'),
    (v_match_id, 'seed_tutor_19', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '29 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    4,
    'Très utile pour maîtriser Excel avancé et les tableaux croisés.',
    NULL,
    NULL,
    now() - interval '27 days'
  );

  INSERT INTO public.profiles (
    clerk_id, full_name, subject, hourly_rate, rating, review_count, role,
    bio, about_tutor, about_course, specialties, avatar_url,
    city, postal_code, latitude, longitude,
    teaching_formats, taught_levels,
    diploma_title, diploma_school, diploma_year,
    response_minutes, contact_phone, created_at
  ) VALUES (
    NULL, 'Amandine Laurent', 'Mathématiques, Français, Anglais, Sciences', 10, 0, 0, 'tutor',
    'Aide aux devoirs complète à Charleroi dès 10 €/h : maths, français, anglais et éveil scientifique.', 'Engagée pour l’égalité des chances dans le Hainaut, je propose un suivi hebdomadaire accessible du primaire jusqu’en 4e secondaire.', 'Vérification complète des devoirs, préparation des évaluations à venir et consolidation des bases en lecture et calcul.', ARRAY['Mathématiques', 'Français', 'Anglais', 'Sciences']::text[], 'https://i.pravatar.cc/400?img=36',
    'Charleroi', '6000', 50.41571, 4.44916,
    ARRAY['Face à face', 'À distance']::text[], ARRAY['Primaire', 'Secondaire']::text[],
    'Bachelier instituteur et régendat polyvalent', 'Haute École Condorcet', 2023,
    18, '+32 492 15 25 35', now() - interval '24 hours'
  ) RETURNING id INTO v_tutor_id;

  INSERT INTO public.matches (parent_id, tutor_id, status, lesson_given_at, lesson_given_by, created_at)
  VALUES ('seed_parent_1', v_tutor_id, 'accepted', now() - interval '28 days', 'seed_parent_1', now() - interval '31 days')
  RETURNING id INTO v_match_id;

  INSERT INTO public.messages (match_id, sender_id, sender_role, content, created_at)
  VALUES
    (v_match_id, 'seed_parent_1', 'parent', 'Bonjour, seriez-vous disponible pour un cours prochainement ?', now() - interval '31 days'),
    (v_match_id, 'seed_tutor_20', 'tutor', 'Bonjour ! Oui avec plaisir, on peut organiser cela ensemble.', now() - interval '30 days');

  INSERT INTO public.reviews (match_id, reviewer_id, tutor_id, rating, comment, reply, replied_at, created_at)
  VALUES (
    v_match_id,
    'seed_parent_1',
    v_tutor_id,
    5,
    'Tarif plus qu’honnête et suivi régulier formidable pour nos deux enfants.',
    'Merci beaucoup pour votre confiance !',
    now() - interval '27 days',
    now() - interval '28 days'
  );
END $$;
