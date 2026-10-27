-- MANYWISE DEVELOPMENT / DEMO SEED ONLY
--
-- Every person and conversation below is fictional. Do not run this seed against a
-- production project. It contains no credentials and intentionally does not INSERT
-- into auth.users (the Auth schema is owned by Supabase Auth and direct inserts are
-- brittle and can violate identity invariants).
--
-- Safe, guarded member strategy:
--   1. In a local/development project, create Auth users through the supported Auth
--      flow using the five @example.invalid addresses listed in the DO block below.
--   2. Run/re-run this file. It resolves their generated auth.users IDs by email,
--      enriches the trigger-created profiles, and inserts the social demo graph.
--   3. If any identity is absent, reference taxonomy is still seeded, but all
--      member-linked content is skipped with a NOTICE rather than violating FKs.
--
-- The reserved .invalid domain makes accidental delivery and collision with real
-- people impractical. All fixed content IDs make this file idempotent where feasible.

begin;

-- The eight core Manywise topic areas. These are safe reference rows and do not
-- depend on Auth identities.
insert into public.interests (
  id, slug, name, manywise_label, description, kind, sort_order, is_active
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'self-awareness-and-identity',
    'Self-awareness & Identity',
    'Inner Compass',
    'Identity, intuition, values, boundaries, and the quiet work of understanding your inner life.',
    'topic_area', 1, true
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'relationships-and-belonging',
    'Relationships & Belonging',
    'Quiet Connections',
    'Friendship, family, partnership, community, and building sincere connection without losing yourself.',
    'topic_area', 2, true
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'purpose-and-work',
    'Purpose & Work',
    'Meaningful Work',
    'Vocation, ethical ambition, contribution, leadership, and sustainable ways to do work that matters.',
    'topic_area', 3, true
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'creativity-and-expression',
    'Creativity & Expression',
    'Creative Sanctuary',
    'Writing, art, music, making, and protecting a private creative practice from perfectionism.',
    'topic_area', 4, true
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'mind-and-body-wellbeing',
    'Mind & Body Wellbeing',
    'Mindful Wellbeing',
    'Rest, sensory care, emotional regulation, movement, and compassionate support without medical claims.',
    'topic_area', 5, true
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    'ideas-and-understanding',
    'Ideas & Understanding',
    'Ideas in Depth',
    'Psychology, philosophy, books, systems thinking, and the patient exploration of difficult questions.',
    'topic_area', 6, true
  ),
  (
    '10000000-0000-4000-8000-000000000007',
    'growth-and-practice',
    'Growth & Practice',
    'Gentle Growth',
    'Habits, reflection, learning, and personal change paced by curiosity rather than self-punishment.',
    'topic_area', 7, true
  ),
  (
    '10000000-0000-4000-8000-000000000008',
    'nature-society-and-service',
    'Nature, Society & Service',
    'The Wider World',
    'Nature, culture, justice, volunteering, and turning empathy into grounded, responsible participation.',
    'topic_area', 8, true
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
  ('11000000-0000-4000-8000-000000000001', 'reflection', 'Reflection', 'Slow observations and considered questions.', true),
  ('11000000-0000-4000-8000-000000000002', 'boundaries', 'Boundaries', 'Respectful limits, consent, and self-trust.', true),
  ('11000000-0000-4000-8000-000000000003', 'creative-practice', 'Creative practice', 'Making consistently without demanding perfection.', true),
  ('11000000-0000-4000-8000-000000000004', 'purpose', 'Purpose', 'Meaning, vocation, and contribution.', true),
  ('11000000-0000-4000-8000-000000000005', 'belonging', 'Belonging', 'Connection that leaves room for difference.', true),
  ('11000000-0000-4000-8000-000000000006', 'rest', 'Rest', 'Restoration, pacing, and sustainable attention.', true),
  ('11000000-0000-4000-8000-000000000007', 'books-and-ideas', 'Books & ideas', 'Thoughtful reading and conceptual exploration.', true),
  ('11000000-0000-4000-8000-000000000008', 'nature-notes', 'Nature notes', 'Observations from the more-than-human world.', true)
on conflict (id) do update
set slug = excluded.slug,
    name = excluded.name,
    description = excluded.description,
    is_active = excluded.is_active;

-- All member-linked content is one guarded unit so the demo graph is coherent.
do $$
declare
  v_mira uuid;
  v_jonah uuid;
  v_noor uuid;
  v_sana uuid;
  v_theo uuid;
  v_direct_key text;
begin
  select id into v_mira
  from auth.users
  where lower(email) = 'mira.lantern@example.invalid'
  order by created_at limit 1;

  select id into v_jonah
  from auth.users
  where lower(email) = 'jonah.moss@example.invalid'
  order by created_at limit 1;

  select id into v_noor
  from auth.users
  where lower(email) = 'noor.vale@example.invalid'
  order by created_at limit 1;

  select id into v_sana
  from auth.users
  where lower(email) = 'sana.reed@example.invalid'
  order by created_at limit 1;

  select id into v_theo
  from auth.users
  where lower(email) = 'theo.harbor@example.invalid'
  order by created_at limit 1;

  if v_mira is null or v_jonah is null or v_noor is null or v_sana is null or v_theo is null then
    raise notice using message =
      'Manywise demo members/content skipped: first create all five fictional @example.invalid Auth users documented at the top of supabase/seed.sql, then rerun the seed.';
    return;
  end if;

  -- Fictional demo profiles. Sana is a demo moderator assigned by this privileged
  -- seed, not by user metadata or a browser update.
  insert into public.profiles (
    id, username, display_name, bio, pronouns, location, role,
    visibility, discoverability, onboarding_state, onboarding_completed_at
  )
  values
    (
      v_mira, 'mira-lantern-demo', 'Mira Lantern (Demo)',
      'Fictional demo member. Quiet-systems designer, tea annotator, and collector of questions that deserve more than a quick answer.',
      'she/her', 'Fictional North Coast', 'member', 'public', 'listed', 'complete', now() - interval '120 days'
    ),
    (
      v_jonah, 'jonah-moss-demo', 'Jonah Moss (Demo)',
      'Fictional demo member. Makes small drawings, tends an unruly balcony garden, and is learning to let unfinished work be useful.',
      'he/they', 'Fictional Alder City', 'member', 'public', 'listed', 'complete', now() - interval '100 days'
    ),
    (
      v_noor, 'noor-vale-demo', 'Noor Vale (Demo)',
      'Fictional demo member. Librarian, careful listener, and host of conversations where nobody has to perform certainty.',
      'they/them', 'Fictional Vale District', 'member', 'members', 'suggestions_only', 'complete', now() - interval '90 days'
    ),
    (
      v_sana, 'sana-reed-demo', 'Sana Reed (Demo)',
      'Fictional demo moderator. Community gardener and facilitator focused on clear boundaries, repair, and unhurried belonging.',
      'she/they', 'Fictional Reed Harbor', 'moderator', 'public', 'listed', 'complete', now() - interval '150 days'
    ),
    (
      v_theo, 'theo-harbor-demo', 'Theo Harbor (Demo)',
      'Fictional demo member. Field recorder, volunteer trail steward, and enthusiastic witness to ordinary acts of care.',
      'he/him', 'Fictional South Harbor', 'member', 'members', 'hidden', 'complete', now() - interval '60 days'
    )
  on conflict (id) do update
  set username = excluded.username,
      display_name = excluded.display_name,
      bio = excluded.bio,
      pronouns = excluded.pronouns,
      location = excluded.location,
      role = excluded.role,
      visibility = excluded.visibility,
      discoverability = excluded.discoverability,
      onboarding_state = excluded.onboarding_state,
      onboarding_completed_at = excluded.onboarding_completed_at;

  insert into public.notification_preferences (
    user_id, in_app_enabled, email_enabled, push_enabled,
    follows_enabled, discussion_activity_enabled, chat_enabled,
    moderation_enabled, digest_frequency, timezone
  )
  values
    (v_mira, true, false, false, true, true, true, true, 'weekly', 'UTC'),
    (v_jonah, true, false, false, true, true, true, true, 'off', 'UTC'),
    (v_noor, true, false, false, true, true, true, true, 'weekly', 'UTC'),
    (v_sana, true, false, false, true, true, true, true, 'daily', 'UTC'),
    (v_theo, true, false, false, true, true, true, true, 'off', 'UTC')
  on conflict (user_id) do update
  set in_app_enabled = excluded.in_app_enabled,
      email_enabled = excluded.email_enabled,
      push_enabled = excluded.push_enabled,
      follows_enabled = excluded.follows_enabled,
      discussion_activity_enabled = excluded.discussion_activity_enabled,
      chat_enabled = excluded.chat_enabled,
      moderation_enabled = excluded.moderation_enabled,
      digest_frequency = excluded.digest_frequency,
      timezone = excluded.timezone;

  insert into public.profile_interests (profile_id, interest_id, is_primary)
  values
    (v_mira,  '10000000-0000-4000-8000-000000000001', true),
    (v_mira,  '10000000-0000-4000-8000-000000000006', false),
    (v_jonah, '10000000-0000-4000-8000-000000000004', true),
    (v_jonah, '10000000-0000-4000-8000-000000000005', false),
    (v_noor,  '10000000-0000-4000-8000-000000000002', true),
    (v_noor,  '10000000-0000-4000-8000-000000000006', false),
    (v_sana,  '10000000-0000-4000-8000-000000000003', true),
    (v_sana,  '10000000-0000-4000-8000-000000000007', false),
    (v_theo,  '10000000-0000-4000-8000-000000000008', true),
    (v_theo,  '10000000-0000-4000-8000-000000000005', false)
  on conflict (profile_id, interest_id) do update
  set is_primary = excluded.is_primary;

  insert into public.spaces (
    id, created_by, primary_interest_id, slug, name, summary, description,
    visibility, join_policy, is_archived
  )
  values
    (
      '20000000-0000-4000-8000-000000000001', v_mira,
      '10000000-0000-4000-8000-000000000001',
      'the-lantern-room', 'The Lantern Room',
      'A calm room for Inner Compass questions.',
      'Bring an unfinished thought, a journal prompt, or a choice you are trying to hear clearly. Advice is opt-in; curiosity comes first.',
      'members', 'request', false
    ),
    (
      '20000000-0000-4000-8000-000000000002', v_jonah,
      '10000000-0000-4000-8000-000000000004',
      'quiet-craft-circle', 'Quiet Craft Circle',
      'A public Creative Sanctuary for gentle accountability.',
      'Share process notes, tiny experiments, and work that does not need to become a product. Specific, kind feedback only when requested.',
      'public', 'open', false
    ),
    (
      '20000000-0000-4000-8000-000000000003', v_sana,
      '10000000-0000-4000-8000-000000000003',
      'purpose-without-burnout', 'Purpose Without Burnout',
      'Meaningful Work without turning a life into a metric.',
      'A member space for vocation, contribution, ethical ambition, and practical ways to protect energy while doing work that matters.',
      'members', 'request', false
    ),
    (
      '20000000-0000-4000-8000-000000000004', v_noor,
      '10000000-0000-4000-8000-000000000002',
      'still-waters-circle', 'Still Waters Circle',
      'An invitation-only Quiet Connections practice room.',
      'A small private space for practicing honest conversation, consent-aware questions, and repair. Membership is intentionally limited.',
      'private', 'invite', false
    )
  on conflict (id) do update
  set created_by = excluded.created_by,
      primary_interest_id = excluded.primary_interest_id,
      slug = excluded.slug,
      name = excluded.name,
      summary = excluded.summary,
      description = excluded.description,
      visibility = excluded.visibility,
      join_policy = excluded.join_policy,
      is_archived = excluded.is_archived;

  -- Explicitly upsert owners too, so a partially seeded local database repairs itself.
  insert into public.space_memberships (
    space_id, user_id, role, status, joined_by, joined_at
  )
  values
    ('20000000-0000-4000-8000-000000000001', v_mira,  'owner',     'active', v_mira,  now() - interval '110 days'),
    ('20000000-0000-4000-8000-000000000001', v_noor,  'moderator', 'active', v_mira,  now() - interval '85 days'),
    ('20000000-0000-4000-8000-000000000001', v_jonah, 'member',    'active', v_mira,  now() - interval '70 days'),
    ('20000000-0000-4000-8000-000000000001', v_sana,  'member',    'active', v_mira,  now() - interval '65 days'),
    ('20000000-0000-4000-8000-000000000002', v_jonah, 'owner',     'active', v_jonah, now() - interval '95 days'),
    ('20000000-0000-4000-8000-000000000002', v_mira,  'member',    'active', v_jonah, now() - interval '62 days'),
    ('20000000-0000-4000-8000-000000000002', v_theo,  'member',    'active', v_jonah, now() - interval '40 days'),
    ('20000000-0000-4000-8000-000000000003', v_sana,  'owner',     'active', v_sana,  now() - interval '140 days'),
    ('20000000-0000-4000-8000-000000000003', v_mira,  'member',    'active', v_sana,  now() - interval '80 days'),
    ('20000000-0000-4000-8000-000000000003', v_noor,  'member',    'active', v_sana,  now() - interval '74 days'),
    ('20000000-0000-4000-8000-000000000003', v_theo,  'member',    'active', v_sana,  now() - interval '32 days'),
    ('20000000-0000-4000-8000-000000000004', v_noor,  'owner',     'active', v_noor,  now() - interval '82 days'),
    ('20000000-0000-4000-8000-000000000004', v_mira,  'member',    'active', v_noor,  now() - interval '78 days'),
    ('20000000-0000-4000-8000-000000000004', v_sana,  'member',    'active', v_noor,  now() - interval '75 days')
  on conflict (space_id, user_id) do update
  set role = excluded.role,
      status = excluded.status,
      joined_by = excluded.joined_by,
      joined_at = excluded.joined_at;

  insert into public.discussions (
    id, author_id, space_id, title, body, visibility,
    publication_state, moderation_state, published_at, created_at
  )
  values
    (
      '30000000-0000-4000-8000-000000000001', v_mira,
      '20000000-0000-4000-8000-000000000001',
      'A two-minute ritual for hearing the quieter answer',
      E'I have been trying a tiny pause before decisions: feet on the floor, one slow breath, then two columns titled “what is loud” and “what is true.” I do not force an answer. Usually the useful distinction is between urgency borrowed from someone else and a value I can actually name.\n\nWhat helps you notice the difference between intuition and fear without pretending either one is infallible?',
      'members', 'published', 'visible', now() - interval '18 days', now() - interval '18 days'
    ),
    (
      '30000000-0000-4000-8000-000000000002', v_jonah,
      '20000000-0000-4000-8000-000000000002',
      'Making something before it has a job',
      E'This month I am drawing one five-minute map of an imaginary place each morning. No portfolio, no posting schedule, no lesson to extract. The absence of a goal felt uncomfortable for a week and then unexpectedly spacious.\n\nIf you keep a Creative Sanctuary practice, how do you protect it from becoming another performance review?',
      'public', 'published', 'visible', now() - interval '12 days', now() - interval '12 days'
    ),
    (
      '30000000-0000-4000-8000-000000000003', v_sana,
      '20000000-0000-4000-8000-000000000003',
      'Purpose is a direction, not a debt',
      E'I used to treat meaningful work as proof that every hour had been justified. That made even service feel extractive. Lately I ask a smaller question: “What form of contribution can this season honestly sustain?”\n\nI would love to hear how others separate purpose from pressure, especially during low-energy seasons.',
      'members', 'published', 'visible', now() - interval '9 days', now() - interval '9 days'
    ),
    (
      '30000000-0000-4000-8000-000000000004', v_noor,
      '20000000-0000-4000-8000-000000000004',
      'Asking for depth without demanding disclosure',
      E'A useful phrase from our last practice was: “Would companionship, questions, or quiet be most welcome?” It offers depth without assuming access to someone else’s story.\n\nWhat other language helps you invite honesty while leaving a real path to say no?',
      'space_members', 'published', 'visible', now() - interval '6 days', now() - interval '6 days'
    ),
    (
      '30000000-0000-4000-8000-000000000005', v_theo,
      null,
      'Field note: the path after rain',
      E'The volunteer trail crew stopped work for ten minutes because a line of salamanders was crossing the wet path. Nobody called it productivity, but it may have been the most useful thing we did all morning.\n\nA note from The Wider World: attention can be a form of service before it becomes an action plan.',
      'members', 'published', 'visible', now() - interval '4 days', now() - interval '4 days'
    )
  on conflict (id) do update
  set author_id = excluded.author_id,
      space_id = excluded.space_id,
      title = excluded.title,
      body = excluded.body,
      visibility = excluded.visibility,
      publication_state = excluded.publication_state,
      moderation_state = excluded.moderation_state,
      published_at = excluded.published_at;

  insert into public.discussion_tags (discussion_id, tag_id)
  values
    ('30000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001'),
    ('30000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000002'),
    ('30000000-0000-4000-8000-000000000002', '11000000-0000-4000-8000-000000000003'),
    ('30000000-0000-4000-8000-000000000002', '11000000-0000-4000-8000-000000000006'),
    ('30000000-0000-4000-8000-000000000003', '11000000-0000-4000-8000-000000000004'),
    ('30000000-0000-4000-8000-000000000003', '11000000-0000-4000-8000-000000000006'),
    ('30000000-0000-4000-8000-000000000004', '11000000-0000-4000-8000-000000000002'),
    ('30000000-0000-4000-8000-000000000004', '11000000-0000-4000-8000-000000000005'),
    ('30000000-0000-4000-8000-000000000005', '11000000-0000-4000-8000-000000000008')
  on conflict do nothing;

  -- Threaded replies; the migration trigger derives and validates depth.
  insert into public.replies (
    id, discussion_id, author_id, parent_reply_id, body,
    publication_state, moderation_state, created_at
  )
  values
    (
      '40000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000001', v_noor, null,
      'I ask whether the feeling becomes clearer when I imagine explaining the choice to nobody. Fear often keeps rehearsing an audience; intuition usually gets simpler.',
      'published', 'visible', now() - interval '17 days 22 hours'
    ),
    (
      '40000000-0000-4000-8000-000000000002',
      '30000000-0000-4000-8000-000000000001', v_mira,
      '40000000-0000-4000-8000-000000000001',
      '“Explaining the choice to nobody” is such a useful test. I am adding that beside the two columns.',
      'published', 'visible', now() - interval '17 days 20 hours'
    ),
    (
      '40000000-0000-4000-8000-000000000003',
      '30000000-0000-4000-8000-000000000002', v_theo, null,
      'I keep one sketchbook that is not allowed to produce shareable work. Calling it habitat instead of output changed how I use it.',
      'published', 'visible', now() - interval '11 days 18 hours'
    ),
    (
      '40000000-0000-4000-8000-000000000004',
      '30000000-0000-4000-8000-000000000002', v_jonah,
      '40000000-0000-4000-8000-000000000003',
      'Habitat is exactly the word. A place where ideas can be alive before they are useful.',
      'published', 'visible', now() - interval '11 days 16 hours'
    ),
    (
      '40000000-0000-4000-8000-000000000005',
      '30000000-0000-4000-8000-000000000003', v_mira, null,
      'A seasonal definition of contribution feels kinder and more accurate than a permanent mission statement.',
      'published', 'visible', now() - interval '8 days 19 hours'
    ),
    (
      '40000000-0000-4000-8000-000000000006',
      '30000000-0000-4000-8000-000000000004', v_sana, null,
      'I like “Is there a part of this you would enjoy being known in?” It is specific about connection and leaves the scope with the speaker.',
      'published', 'visible', now() - interval '5 days 21 hours'
    ),
    (
      '40000000-0000-4000-8000-000000000007',
      '30000000-0000-4000-8000-000000000005', v_jonah, null,
      'Thank you for noticing before naming a lesson. The pause itself sounds like stewardship.',
      'published', 'visible', now() - interval '3 days 20 hours'
    )
  on conflict (id) do update
  set body = excluded.body,
      publication_state = excluded.publication_state,
      moderation_state = excluded.moderation_state;

  insert into public.discussion_reactions (discussion_id, user_id, kind)
  values
    ('30000000-0000-4000-8000-000000000001', v_noor, 'resonates'),
    ('30000000-0000-4000-8000-000000000001', v_sana, 'thoughtful'),
    ('30000000-0000-4000-8000-000000000002', v_mira, 'insightful'),
    ('30000000-0000-4000-8000-000000000002', v_theo, 'resonates'),
    ('30000000-0000-4000-8000-000000000003', v_noor, 'support'),
    ('30000000-0000-4000-8000-000000000005', v_mira, 'thoughtful')
  on conflict do nothing;

  insert into public.reply_reactions (reply_id, user_id, kind)
  values
    ('40000000-0000-4000-8000-000000000001', v_mira, 'insightful'),
    ('40000000-0000-4000-8000-000000000003', v_jonah, 'resonates'),
    ('40000000-0000-4000-8000-000000000005', v_sana, 'thoughtful')
  on conflict do nothing;

  insert into public.saved_discussions (user_id, discussion_id)
  values
    (v_mira, '30000000-0000-4000-8000-000000000003'),
    (v_noor, '30000000-0000-4000-8000-000000000001'),
    (v_theo, '30000000-0000-4000-8000-000000000002')
  on conflict do nothing;

  insert into public.follows (follower_id, followed_id)
  values
    (v_mira, v_noor),
    (v_noor, v_mira),
    (v_jonah, v_theo),
    (v_theo, v_jonah),
    (v_sana, v_mira)
  on conflict do nothing;

  v_direct_key := least(v_mira::text, v_noor::text) || ':' || greatest(v_mira::text, v_noor::text);

  insert into public.chat_rooms (
    id, room_type, created_by, space_id, title, topic, direct_key, is_archived, created_at
  )
  values
    (
      '50000000-0000-4000-8000-000000000001', 'direct', v_mira, null, null, null,
      v_direct_key, false, now() - interval '14 days'
    ),
    (
      '50000000-0000-4000-8000-000000000002', 'space', v_mira,
      '20000000-0000-4000-8000-000000000001',
      'Lantern Room chat', 'Small observations and gentle check-ins.', null,
      false, now() - interval '20 days'
    )
  on conflict (id) do update
  set created_by = excluded.created_by,
      space_id = excluded.space_id,
      title = excluded.title,
      topic = excluded.topic,
      direct_key = excluded.direct_key,
      is_archived = excluded.is_archived;

  insert into public.chat_room_members (
    room_id, user_id, role, status, invited_by, joined_at
  )
  values
    ('50000000-0000-4000-8000-000000000001', v_mira, 'owner',  'active', v_mira, now() - interval '14 days'),
    ('50000000-0000-4000-8000-000000000001', v_noor, 'member', 'active', v_mira, now() - interval '14 days'),
    ('50000000-0000-4000-8000-000000000002', v_mira,  'owner',     'active', v_mira, now() - interval '20 days'),
    ('50000000-0000-4000-8000-000000000002', v_noor,  'moderator', 'active', v_mira, now() - interval '20 days'),
    ('50000000-0000-4000-8000-000000000002', v_jonah, 'member',    'active', v_mira, now() - interval '18 days'),
    ('50000000-0000-4000-8000-000000000002', v_sana,  'member',    'active', v_mira, now() - interval '17 days')
  on conflict (room_id, user_id) do update
  set role = excluded.role,
      status = excluded.status,
      invited_by = excluded.invited_by,
      joined_at = excluded.joined_at;

  -- Chat message replies use reply_to_message_id and are constrained to one room.
  insert into public.chat_messages (
    id, room_id, sender_id, reply_to_message_id, body,
    publication_state, moderation_state, created_at
  )
  values
    (
      '60000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001', v_mira, null,
      'Would you be open to reading a short draft tomorrow? I would value questions, not line edits.',
      'published', 'visible', now() - interval '2 days 4 hours'
    ),
    (
      '60000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000001', v_noor,
      '60000000-0000-4000-8000-000000000001',
      'Yes. Questions only, and tomorrow afternoon works. Send it when it feels ready enough.',
      'published', 'visible', now() - interval '2 days 3 hours 52 minutes'
    ),
    (
      '60000000-0000-4000-8000-000000000003',
      '50000000-0000-4000-8000-000000000001', v_mira,
      '60000000-0000-4000-8000-000000000002',
      'Thank you for naming both the kind of attention and the timing.',
      'published', 'visible', now() - interval '2 days 3 hours 45 minutes'
    ),
    (
      '60000000-0000-4000-8000-000000000004',
      '50000000-0000-4000-8000-000000000002', v_jonah, null,
      'Small check-in: what is one thing you are not rushing today?',
      'published', 'visible', now() - interval '1 day 5 hours'
    ),
    (
      '60000000-0000-4000-8000-000000000005',
      '50000000-0000-4000-8000-000000000002', v_mira,
      '60000000-0000-4000-8000-000000000004',
      'An answer to a kind email. I want to reply from steadiness instead of reflex.',
      'published', 'visible', now() - interval '1 day 4 hours 48 minutes'
    ),
    (
      '60000000-0000-4000-8000-000000000006',
      '50000000-0000-4000-8000-000000000002', v_noor,
      '60000000-0000-4000-8000-000000000004',
      'Choosing the next book for the display. The empty shelf can wait while I read the first pages.',
      'published', 'visible', now() - interval '1 day 4 hours 39 minutes'
    ),
    (
      '60000000-0000-4000-8000-000000000007',
      '50000000-0000-4000-8000-000000000002', v_sana, null,
      'Moderator note for the demo room: care is welcome here, but nobody is expected to provide crisis support. Use local professional resources for urgent help.',
      'published', 'visible', now() - interval '20 hours'
    )
  on conflict (id) do update
  set body = excluded.body,
      publication_state = excluded.publication_state,
      moderation_state = excluded.moderation_state;

  insert into public.chat_message_reactions (message_id, user_id, kind)
  values
    ('60000000-0000-4000-8000-000000000001', v_noor, 'support'),
    ('60000000-0000-4000-8000-000000000004', v_mira, 'thoughtful'),
    ('60000000-0000-4000-8000-000000000005', v_jonah, 'resonates'),
    ('60000000-0000-4000-8000-000000000007', v_mira, 'support')
  on conflict do nothing;

  insert into public.chat_read_states (
    room_id, user_id, last_read_message_id, last_read_at
  )
  values
    ('50000000-0000-4000-8000-000000000001', v_mira,  '60000000-0000-4000-8000-000000000003', now() - interval '2 days 3 hours 40 minutes'),
    ('50000000-0000-4000-8000-000000000001', v_noor,  '60000000-0000-4000-8000-000000000003', now() - interval '2 days 3 hours 39 minutes'),
    ('50000000-0000-4000-8000-000000000002', v_mira,  '60000000-0000-4000-8000-000000000007', now() - interval '18 hours'),
    ('50000000-0000-4000-8000-000000000002', v_noor,  '60000000-0000-4000-8000-000000000007', now() - interval '17 hours'),
    ('50000000-0000-4000-8000-000000000002', v_jonah, '60000000-0000-4000-8000-000000000006', now() - interval '1 day 4 hours'),
    ('50000000-0000-4000-8000-000000000002', v_sana,  '60000000-0000-4000-8000-000000000007', now() - interval '19 hours')
  on conflict (room_id, user_id) do update
  set last_read_message_id = excluded.last_read_message_id,
      last_read_at = excluded.last_read_at;

  -- Server-authored demo notifications. These remain private to each recipient.
  insert into public.notifications (
    id, recipient_id, actor_id, type, entity_type, entity_id,
    title, body, data, dedupe_key, created_at
  )
  values
    (
      '70000000-0000-4000-8000-000000000001', v_mira, v_noor,
      'reply', 'reply', '40000000-0000-4000-8000-000000000001',
      'Noor replied in The Lantern Room',
      'A new thoughtful reply is waiting when you have space.',
      jsonb_build_object('discussion_id', '30000000-0000-4000-8000-000000000001'),
      'demo:reply:40000000-0000-4000-8000-000000000001', now() - interval '17 days 22 hours'
    ),
    (
      '70000000-0000-4000-8000-000000000002', v_jonah, v_theo,
      'discussion_reaction', 'discussion', '30000000-0000-4000-8000-000000000002',
      'Theo resonated with your discussion',
      'Making something before it has a job resonated with Theo.',
      '{}'::jsonb,
      'demo:reaction:30000000-0000-4000-8000-000000000002:theo', now() - interval '11 days'
    ),
    (
      '70000000-0000-4000-8000-000000000003', v_noor, v_mira,
      'chat_message', 'chat_message', '60000000-0000-4000-8000-000000000001',
      'A new message from Mira',
      'Open the conversation when you are ready.',
      jsonb_build_object('room_id', '50000000-0000-4000-8000-000000000001'),
      'demo:message:60000000-0000-4000-8000-000000000001', now() - interval '2 days 4 hours'
    )
  on conflict (id) do update
  set recipient_id = excluded.recipient_id,
      actor_id = excluded.actor_id,
      type = excluded.type,
      entity_type = excluded.entity_type,
      entity_id = excluded.entity_id,
      title = excluded.title,
      body = excluded.body,
      data = excluded.data,
      dedupe_key = excluded.dedupe_key;

  raise notice 'Manywise fictional demo members, spaces, discussions, replies, and chats seeded successfully.';
end
$$;

commit;
