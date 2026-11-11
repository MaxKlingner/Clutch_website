-- Strict RLS migration for Clutch using Clerk Third-Party Auth.
-- DO NOT RUN until:
-- 1) Clerk is configured for Supabase (role = "authenticated" claim in session token)
-- 2) Clerk is added in Supabase Dashboard -> Authentication -> Third-Party Auth
-- 3) NEXT_PUBLIC_CLERK_SUPABASE_AUTH=true is set in the web app (and mobile app sends Clerk JWT)

-- Helper RPCs so authenticated users can read only allowed fields across restricted tables
CREATE OR REPLACE FUNCTION public.get_tutor_contact_phone(target_tutor_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
declare
  v_sub text;
  v_phone text;
begin
  v_sub := nullif(auth.jwt() ->> 'sub', '');
  if v_sub is null then
    return null;
  end if;

  select nullif(btrim(p.contact_phone), '')
  into v_phone
  from public.profiles p
  where p.id = target_tutor_id;

  return v_phone;
end;
$function$;

REVOKE ALL ON FUNCTION public.get_tutor_contact_phone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_tutor_contact_phone(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_match_parent_names(target_match_ids uuid[])
RETURNS TABLE (parent_id text, first_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
declare
  v_sub text;
begin
  v_sub := nullif(auth.jwt() ->> 'sub', '');
  if v_sub is null or target_match_ids is null or cardinality(target_match_ids) = 0 then
    return;
  end if;

  return query
  select distinct
    m.parent_id,
    coalesce(
      nullif(btrim(up.first_name), ''),
      nullif(split_part(btrim(coalesce(up.full_name, '')), ' ', 1), ''),
      'Ã‰lÃ¨ve'
    ) as first_name
  from public.matches m
  left join public.profiles p on p.id = m.tutor_id
  left join public.user_profiles up on up.clerk_id = m.parent_id
  where m.id = any(target_match_ids)
    and (m.parent_id = v_sub or p.clerk_id = v_sub);
end;
$function$;

REVOKE ALL ON FUNCTION public.get_match_parent_names(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_match_parent_names(uuid[]) TO authenticated;

-- Hide contact_phone column from anonymous REST queries while keeping public tutor columns readable
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id, clerk_id, full_name, subject, hourly_rate, rating, review_count,
  lessons_given, role, bio, about_tutor, about_course, specialties,
  study_year, avatar_url, city, postal_code, latitude, longitude,
  teaching_formats, taught_levels, diploma_title, diploma_school,
  diploma_year, response_minutes, has_contact_phone, created_at
) ON public.profiles TO anon;

-- 1. public.profiles
ALTER POLICY profiles_select_all ON public.profiles
  TO anon, authenticated
  USING (true);

ALTER POLICY profiles_insert_all ON public.profiles
  TO authenticated
  WITH CHECK (clerk_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY profiles_update_all ON public.profiles
  TO authenticated
  USING (clerk_id = ((select auth.jwt()) ->> 'sub'))
  WITH CHECK (clerk_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY profiles_delete_all ON public.profiles
  TO authenticated
  USING (clerk_id = ((select auth.jwt()) ->> 'sub'));

-- 2. public.user_profiles
ALTER POLICY user_profiles_select_all ON public.user_profiles
  TO authenticated
  USING (clerk_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY user_profiles_insert_all ON public.user_profiles
  TO authenticated
  WITH CHECK (clerk_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY user_profiles_update_all ON public.user_profiles
  TO authenticated
  USING (clerk_id = ((select auth.jwt()) ->> 'sub'))
  WITH CHECK (clerk_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY user_profiles_delete_all ON public.user_profiles
  TO authenticated
  USING (clerk_id = ((select auth.jwt()) ->> 'sub'));

-- 3. public.matches
ALTER POLICY matches_select_all ON public.matches
  TO authenticated
  USING (
    parent_id = ((select auth.jwt()) ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = matches.tutor_id
        AND p.clerk_id = ((select auth.jwt()) ->> 'sub')
    )
  );

ALTER POLICY matches_insert_all ON public.matches
  TO authenticated
  WITH CHECK (parent_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY matches_update_all ON public.matches
  TO authenticated
  USING (
    parent_id = ((select auth.jwt()) ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = matches.tutor_id
        AND p.clerk_id = ((select auth.jwt()) ->> 'sub')
    )
  )
  WITH CHECK (
    parent_id = ((select auth.jwt()) ->> 'sub')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = matches.tutor_id
        AND p.clerk_id = ((select auth.jwt()) ->> 'sub')
    )
  );

ALTER POLICY matches_delete_all ON public.matches
  TO authenticated
  USING (false);

-- 4. public.messages
ALTER POLICY messages_select_all ON public.messages
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.matches m
      LEFT JOIN public.profiles p ON p.id = m.tutor_id
      WHERE m.id = messages.match_id
        AND (
          m.parent_id = ((select auth.jwt()) ->> 'sub')
          OR p.clerk_id = ((select auth.jwt()) ->> 'sub')
        )
    )
  );

ALTER POLICY messages_insert_all ON public.messages
  TO authenticated
  WITH CHECK (
    sender_id = ((select auth.jwt()) ->> 'sub')
    AND EXISTS (
      SELECT 1
      FROM public.matches m
      LEFT JOIN public.profiles p ON p.id = m.tutor_id
      WHERE m.id = messages.match_id
        AND (
          (messages.sender_role = 'parent' AND m.parent_id = ((select auth.jwt()) ->> 'sub'))
          OR (messages.sender_role = 'tutor' AND p.clerk_id = ((select auth.jwt()) ->> 'sub'))
        )
    )
  );

ALTER POLICY messages_update_all ON public.messages
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER POLICY messages_delete_all ON public.messages
  TO authenticated
  USING (false);

-- 5. public.reviews
ALTER POLICY reviews_select_all ON public.reviews
  TO anon, authenticated
  USING (true);

ALTER POLICY reviews_insert_all ON public.reviews
  TO authenticated
  WITH CHECK (reviewer_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY reviews_update_all ON public.reviews
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reviews.tutor_id
        AND p.clerk_id = ((select auth.jwt()) ->> 'sub')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reviews.tutor_id
        AND p.clerk_id = ((select auth.jwt()) ->> 'sub')
    )
  );

ALTER POLICY reviews_delete_all ON public.reviews
  TO authenticated
  USING (false);

-- 6. public.favorite_tutors
ALTER POLICY favorite_tutors_select_all ON public.favorite_tutors
  TO authenticated
  USING (user_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY favorite_tutors_insert_all ON public.favorite_tutors
  TO authenticated
  WITH CHECK (user_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY favorite_tutors_update_all ON public.favorite_tutors
  TO authenticated
  USING (user_id = ((select auth.jwt()) ->> 'sub'))
  WITH CHECK (user_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY favorite_tutors_delete_all ON public.favorite_tutors
  TO authenticated
  USING (user_id = ((select auth.jwt()) ->> 'sub'));

-- 7. public.reports
ALTER POLICY reports_select_all ON public.reports
  TO authenticated
  USING (false);

ALTER POLICY reports_insert_all ON public.reports
  TO authenticated
  WITH CHECK (reporter_id = ((select auth.jwt()) ->> 'sub'));

-- 8. public.email_consents
ALTER POLICY email_consents_select_all ON public.email_consents
  TO authenticated
  USING (clerk_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY email_consents_insert_all ON public.email_consents
  TO authenticated
  WITH CHECK (clerk_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY email_consents_update_all ON public.email_consents
  TO authenticated
  USING (clerk_id = ((select auth.jwt()) ->> 'sub'))
  WITH CHECK (clerk_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY email_consents_delete_all ON public.email_consents
  TO authenticated
  USING (clerk_id = ((select auth.jwt()) ->> 'sub'));

-- 9. Legacy wallet / payment tables (locked to owner or disabled)
ALTER POLICY wallets_select_all ON public.wallets
  TO authenticated
  USING (clerk_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY wallets_insert_all ON public.wallets
  TO authenticated
  WITH CHECK (false);

ALTER POLICY wallets_update_all ON public.wallets
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER POLICY wallets_delete_all ON public.wallets
  TO authenticated
  USING (false);

ALTER POLICY wallet_topups_select_all ON public.wallet_topups
  TO authenticated
  USING (clerk_id = ((select auth.jwt()) ->> 'sub'));

ALTER POLICY wallet_topups_insert_all ON public.wallet_topups
  TO authenticated
  WITH CHECK (false);

ALTER POLICY wallet_topups_update_all ON public.wallet_topups
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER POLICY wallet_topups_delete_all ON public.wallet_topups
  TO authenticated
  USING (false);

ALTER POLICY payment_transactions_select_all ON public.payment_transactions
  TO authenticated
  USING (
    parent_clerk_id = ((select auth.jwt()) ->> 'sub')
    OR tutor_clerk_id = ((select auth.jwt()) ->> 'sub')
  );

ALTER POLICY payment_transactions_insert_all ON public.payment_transactions
  TO authenticated
  WITH CHECK (false);

ALTER POLICY payment_transactions_update_all ON public.payment_transactions
  TO authenticated
  USING (false)
  WITH CHECK (false);

ALTER POLICY payment_transactions_delete_all ON public.payment_transactions
  TO authenticated
  USING (false);

-- 10. Storage bucket tutor-avatars (owner folder only)
ALTER POLICY "Public read tutor avatars" ON storage.objects
  TO anon, authenticated
  USING (bucket_id = 'tutor-avatars');

ALTER POLICY "Anon upload tutor avatars" ON storage.objects
  TO authenticated
  WITH CHECK (
    bucket_id = 'tutor-avatars'
    AND (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  );

ALTER POLICY "Anon update tutor avatars" ON storage.objects
  TO authenticated
  USING (
    bucket_id = 'tutor-avatars'
    AND (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  )
  WITH CHECK (
    bucket_id = 'tutor-avatars'
    AND (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  );

ALTER POLICY "Anon delete tutor avatars" ON storage.objects
  TO authenticated
  USING (
    bucket_id = 'tutor-avatars'
    AND (storage.foldername(name))[1] = ((select auth.jwt()) ->> 'sub')
  );

