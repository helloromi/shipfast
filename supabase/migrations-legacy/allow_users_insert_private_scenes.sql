-- Autoriser l'import côté serveur (avec le token user) à créer des scènes privées et leur contenu.
-- Sans ces policies, les inserts échouent avec:
-- "new row violates row-level security policy for table \"scenes\""

do $$
begin
  -- SCENES: l'utilisateur peut insérer une scène dont il est propriétaire.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'scenes'
      and policyname = 'Users insert own scenes'
  ) then
    create policy "Users insert own scenes"
      on public.scenes
      for insert
      with check (owner_user_id = auth.uid());
  end if;

  -- SCENES: l'utilisateur peut mettre à jour / supprimer ses scènes (utile pour évolutions futures).
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'scenes'
      and policyname = 'Users update own scenes'
  ) then
    create policy "Users update own scenes"
      on public.scenes
      for update
      using (owner_user_id = auth.uid())
      with check (owner_user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'scenes'
      and policyname = 'Users delete own scenes'
  ) then
    create policy "Users delete own scenes"
      on public.scenes
      for delete
      using (owner_user_id = auth.uid());
  end if;

  -- CHARACTERS: l'utilisateur peut insérer des personnages uniquement dans ses scènes.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'characters'
      and policyname = 'Users insert characters in owned scenes'
  ) then
    create policy "Users insert characters in owned scenes"
      on public.characters
      for insert
      with check (
        exists (
          select 1 from public.scenes s
          where s.id = characters.scene_id
            and s.owner_user_id = auth.uid()
        )
      );
  end if;

  -- LINES: l'utilisateur peut insérer des répliques uniquement dans ses scènes.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lines'
      and policyname = 'Users insert lines in owned scenes'
  ) then
    create policy "Users insert lines in owned scenes"
      on public.lines
      for insert
      with check (
        exists (
          select 1 from public.scenes s
          where s.id = lines.scene_id
            and s.owner_user_id = auth.uid()
        )
      );
  end if;
end $$;



