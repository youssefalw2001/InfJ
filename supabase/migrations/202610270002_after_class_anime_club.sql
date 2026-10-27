-- Manywise after-class anime club taxonomy
-- Adds a media-study interest without changing the eight core wellbeing/topic areas.

begin;

insert into public.interests (
  id, slug, name, manywise_label, description, kind, sort_order, is_active
)
values (
  '10000000-0000-4000-8000-000000000009',
  'anime-and-character-study',
  'Anime & Character Study',
  'Media Club',
  'Character arcs, visual symbolism, music, comfort stories, craft, and respectful spoiler-labeled fandom conversation.',
  'theme', 9, true
)
on conflict (id) do update
set slug = excluded.slug,
    name = excluded.name,
    manywise_label = excluded.manywise_label,
    description = excluded.description,
    kind = excluded.kind,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into public.tags (id, slug, name, description, is_active)
values
  ('11000000-0000-4000-8000-000000000009', 'character-arcs', 'Character arcs', 'How fictional characters change, choose, repair, and reveal values.', true),
  ('11000000-0000-4000-8000-000000000010', 'spoilers-labeled', 'Spoilers labeled', 'Conversation that clearly marks story spoilers before revealing them.', true)
on conflict (id) do update
set slug = excluded.slug,
    name = excluded.name,
    description = excluded.description,
    is_active = excluded.is_active;

commit;
