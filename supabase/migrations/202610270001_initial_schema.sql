-- Manywise initial schema
-- Production-oriented baseline for a reflective, privacy-conscious community.
--
-- Security boundaries:
--   * Authorization comes from auth.uid() and public.profiles.role only. JWT user
--     metadata is never trusted for authorization.
--   * Moderator helpers live in the non-exposed private schema, are SECURITY
--     DEFINER, and pin an empty search_path. Keep private out of API exposed schemas.
--   * service_role/postgres are trusted deployment identities. Browser clients use
--     anon/authenticated grants plus RLS; no secret or service key belongs in SQL.
--   * Polymorphic report/moderation targets are validated on write. Their foreign-key
--     lifecycle is intentionally handled by the moderation service so evidence can be
--     retained after content is soft-removed.
--   * Mutes are preference signals for feeds/notifications. Blocks are hard social
--     boundaries and are applied to profile, content, follow, notification, and chat
--     reads where doing so does not break moderation visibility.

begin;

create schema if not exists private;
comment on schema private is
  'Non-exposed authorization and trigger functions. Do not add this schema to PostgREST exposed schemas.';

revoke all on schema private from public;
revoke create on schema public from public;

do $$
begin
  create type public.account_role as enum ('member', 'moderator', 'admin');
  create type public.profile_visibility as enum ('public', 'members', 'private');
  create type public.profile_discoverability as enum ('listed', 'suggestions_only', 'hidden');
  create type public.onboarding_state as enum ('profile', 'interests', 'community', 'complete');
  create type public.interest_kind as enum ('topic_area', 'practice', 'theme');
  create type public.space_visibility as enum ('public', 'members', 'private');
  create type public.space_join_policy as enum ('open', 'request', 'invite');
  create type public.membership_role as enum ('member', 'moderator', 'owner');
  create type public.membership_status as enum ('invited', 'pending', 'active', 'left', 'banned');
  create type public.content_visibility as enum ('public', 'members', 'space_members', 'private');
  create type public.publication_state as enum ('published', 'archived');
  create type public.moderation_state as enum ('visible', 'pending_review', 'hidden', 'removed');
  create type public.reaction_kind as enum ('resonates', 'thoughtful', 'insightful', 'support');
  create type public.chat_room_type as enum ('direct', 'group', 'space');
  create type public.notification_type as enum (
    'new_follower', 'discussion_reaction', 'reply', 'reply_reaction',
    'chat_message', 'space_invitation', 'moderation_update', 'system'
  );
  create type public.notification_entity_type as enum (
    'profile', 'space', 'discussion', 'reply', 'chat_room', 'chat_message', 'report'
  );
  create type public.digest_frequency as enum ('off', 'daily', 'weekly');
  create type public.mute_target_type as enum ('profile', 'space', 'discussion', 'chat_room');
  create type public.report_target_type as enum (
    'profile', 'space', 'discussion', 'reply', 'chat_room', 'chat_message'
  );
  create type public.report_reason as enum (
    'harassment', 'hate_or_abuse', 'spam', 'privacy', 'self_harm_concern',
    'misinformation', 'off_topic', 'other'
  );
  create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
  create type public.moderation_action_type as enum (
    'warn', 'hide', 'remove', 'restore', 'restrict', 'suspend', 'ban', 'unban'
  );
exception
  when duplicate_object then null;
end
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  bio text not null default '',
  pronouns text,
  location text,
  avatar_path text,
  role public.account_role not null default 'member',
  visibility public.profile_visibility not null default 'members',
  discoverability public.profile_discoverability not null default 'listed',
  onboarding_state public.onboarding_state not null default 'profile',
  onboarding_completed_at timestamptz,
  is_suspended boolean not null default false,
  suspended_until timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, coalesce(username, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(display_name, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(bio, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(location, '')), 'C')
  ) stored,
  constraint profiles_username_format check (
    username = lower(username)
    and username ~ '^[a-z0-9][a-z0-9_-]{2,63}$'
  ),
  constraint profiles_display_name_length check (char_length(btrim(display_name)) between 1 and 80),
  constraint profiles_bio_length check (char_length(bio) <= 2000),
  constraint profiles_pronouns_length check (pronouns is null or char_length(pronouns) <= 80),
  constraint profiles_location_length check (location is null or char_length(location) <= 120),
  constraint profiles_avatar_path check (avatar_path is null or (char_length(avatar_path) <= 500 and avatar_path !~ '^/')),
  constraint profiles_onboarding_completion check (
    (onboarding_state = 'complete' and onboarding_completed_at is not null)
    or (onboarding_state <> 'complete' and onboarding_completed_at is null)
  ),
  constraint profiles_suspension_shape check (is_suspended or suspended_until is null)
);
comment on table public.profiles is
  'One application identity per auth.users row. Elevated roles and suspension fields are trusted-backend managed.';
comment on column public.profiles.avatar_path is
  'Storage object path in the private avatars bucket, conventionally {profile_id}/{filename}.';

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  manywise_label text not null,
  description text not null default '',
  kind public.interest_kind not null default 'theme',
  sort_order smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(manywise_label, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(description, '')), 'B')
  ) stored,
  constraint interests_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint interests_name_length check (char_length(btrim(name)) between 1 and 80),
  constraint interests_label_length check (char_length(btrim(manywise_label)) between 1 and 80),
  constraint interests_description_length check (char_length(description) <= 1000),
  constraint interests_sort_order check (sort_order >= 0)
);

create table public.profile_interests (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (profile_id, interest_id)
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  primary_interest_id uuid references public.interests(id) on delete set null,
  slug text not null unique,
  name text not null,
  summary text not null default '',
  description text not null default '',
  visibility public.space_visibility not null default 'members',
  join_policy public.space_join_policy not null default 'request',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(description, '')), 'C')
  ) stored,
  constraint spaces_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint spaces_name_length check (char_length(btrim(name)) between 1 and 120),
  constraint spaces_summary_length check (char_length(summary) <= 280),
  constraint spaces_description_length check (char_length(description) <= 10000),
  constraint spaces_private_join_policy check (visibility <> 'private' or join_policy <> 'open')
);

create table public.space_memberships (
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.membership_role not null default 'member',
  status public.membership_status not null default 'pending',
  joined_by uuid references public.profiles(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (space_id, user_id),
  constraint space_memberships_joined_at check (
    (status = 'active' and joined_at is not null) or status <> 'active'
  )
);
comment on table public.space_memberships is
  'Space-local role and lifecycle. Triggers prevent members from promoting themselves or removing the owner row.';

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(description, '')), 'B')
  ) stored,
  constraint tags_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint tags_name_length check (char_length(btrim(name)) between 1 and 60),
  constraint tags_description_length check (char_length(description) <= 500)
);

create table public.discussions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete cascade,
  title text not null,
  body text not null,
  visibility public.content_visibility not null default 'members',
  publication_state public.publication_state not null default 'published',
  moderation_state public.moderation_state not null default 'visible',
  content_warning text,
  published_at timestamptz not null default now(),
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(body, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(content_warning, '')), 'C')
  ) stored,
  constraint discussions_title_length check (char_length(btrim(title)) between 3 and 180),
  constraint discussions_body_length check (char_length(btrim(body)) between 1 and 50000),
  constraint discussions_warning_length check (content_warning is null or char_length(content_warning) <= 240),
  constraint discussions_space_visibility_shape check (visibility <> 'space_members' or space_id is not null),
  constraint discussions_publish_time check (published_at >= created_at - interval '5 minutes')
);
comment on table public.discussions is
  'Published discussion records. Autosaved/unpublished work lives in discussion_drafts.';

create table public.discussion_tags (
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (discussion_id, tag_id)
);

create table public.discussion_images (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null,
  width integer,
  height integer,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint discussion_images_path check (char_length(storage_path) <= 500 and storage_path !~ '^/'),
  constraint discussion_images_alt_text check (char_length(btrim(alt_text)) between 1 and 500),
  constraint discussion_images_dimensions check (
    (width is null and height is null)
    or (width between 1 and 12000 and height between 1 and 12000)
  ),
  constraint discussion_images_sort_order check (sort_order >= 0)
);
comment on column public.discussion_images.storage_path is
  'Object path in discussion-images, conventionally {discussion_id}/{filename}; metadata does not prove object existence.';

create table public.discussion_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  discussion_id uuid references public.discussions(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null default '',
  body text not null default '',
  visibility public.content_visibility not null default 'members',
  client_revision bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discussion_drafts_title_length check (char_length(title) <= 180),
  constraint discussion_drafts_body_length check (char_length(body) <= 50000),
  constraint discussion_drafts_revision check (client_revision >= 0),
  constraint discussion_drafts_space_visibility_shape check (visibility <> 'space_members' or space_id is not null),
  unique nulls not distinct (owner_id, discussion_id)
);
comment on table public.discussion_drafts is
  'Private autosaves. Global moderators may access them only through RLS for safety/legal review; normal discovery never includes drafts.';

create table public.replies (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_reply_id uuid,
  body text not null,
  depth smallint not null default 0,
  publication_state public.publication_state not null default 'published',
  moderation_state public.moderation_state not null default 'visible',
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector('english'::regconfig, coalesce(body, ''))
  ) stored,
  constraint replies_body_length check (char_length(btrim(body)) between 1 and 20000),
  constraint replies_depth check (depth between 0 and 8),
  unique (id, discussion_id),
  foreign key (parent_reply_id, discussion_id)
    references public.replies(id, discussion_id) on delete restrict
);

create table public.discussion_reactions (
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (discussion_id, user_id, kind)
);

create table public.reply_reactions (
  reply_id uuid not null references public.replies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (reply_id, user_id, kind)
);

create table public.saved_discussions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, discussion_id)
);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint follows_not_self check (follower_id <> followed_id)
);

create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  room_type public.chat_room_type not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  space_id uuid references public.spaces(id) on delete cascade,
  title text,
  topic text,
  direct_key text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_rooms_title_length check (title is null or char_length(btrim(title)) between 1 and 120),
  constraint chat_rooms_topic_length check (topic is null or char_length(topic) <= 500),
  constraint chat_rooms_shape check (
    (room_type = 'direct' and space_id is null and direct_key is not null)
    or (room_type = 'group' and space_id is null and direct_key is null)
    or (room_type = 'space' and space_id is not null and direct_key is null)
  ),
  constraint chat_rooms_direct_key_format check (
    direct_key is null
    or (
      char_length(direct_key) = 73
      and direct_key ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      and split_part(direct_key, ':', 1) < split_part(direct_key, ':', 2)
      and created_by::text in (split_part(direct_key, ':', 1), split_part(direct_key, ':', 2))
    )
  )
);
create unique index chat_rooms_direct_key_uidx
  on public.chat_rooms (direct_key) where room_type = 'direct';
comment on column public.chat_rooms.direct_key is
  'Canonical least(user_uuid)::text || '':'' || greatest(user_uuid)::text. The application should create direct rooms transactionally.';

create table public.chat_room_members (
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.membership_role not null default 'member',
  status public.membership_status not null default 'active',
  invited_by uuid references public.profiles(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (room_id, user_id),
  constraint chat_room_members_joined_at check (
    (status = 'active' and joined_at is not null) or status <> 'active'
  )
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  reply_to_message_id uuid,
  body text not null,
  publication_state public.publication_state not null default 'published',
  moderation_state public.moderation_state not null default 'visible',
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector('english'::regconfig, coalesce(body, ''))
  ) stored,
  constraint chat_messages_body_length check (char_length(btrim(body)) between 1 and 10000),
  unique (id, room_id),
  foreign key (reply_to_message_id, room_id)
    references public.chat_messages(id, room_id) on delete restrict
);
comment on column public.chat_messages.reply_to_message_id is
  'Message-level reply relation; the composite FK guarantees the replied-to message belongs to the same room.';

create table public.chat_message_reactions (
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, kind)
);

create table public.chat_read_states (
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_message_id uuid,
  last_read_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (room_id, user_id),
  foreign key (last_read_message_id, room_id)
    references public.chat_messages(id, room_id) on delete set null (last_read_message_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type public.notification_type not null,
  entity_type public.notification_entity_type,
  entity_id uuid,
  title text not null,
  body text not null default '',
  data jsonb not null default '{}'::jsonb,
  dedupe_key text unique,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  constraint notifications_title_length check (char_length(btrim(title)) between 1 and 180),
  constraint notifications_body_length check (char_length(body) <= 2000),
  constraint notifications_data_object check (jsonb_typeof(data) = 'object'),
  constraint notifications_entity_shape check (
    (entity_type is null and entity_id is null) or (entity_type is not null and entity_id is not null)
  ),
  constraint notifications_expiry check (expires_at is null or expires_at > created_at)
);
comment on table public.notifications is
  'Server-authored events. Clients may read/delete their own rows and only update read_at; they cannot spoof notifications.';

create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default false,
  push_enabled boolean not null default false,
  follows_enabled boolean not null default true,
  discussion_activity_enabled boolean not null default true,
  chat_enabled boolean not null default true,
  moderation_enabled boolean not null default true,
  digest_frequency public.digest_frequency not null default 'off',
  quiet_hours_start time,
  quiet_hours_end time,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_preferences_quiet_hours check (
    (quiet_hours_start is null and quiet_hours_end is null)
    or (quiet_hours_start is not null and quiet_hours_end is not null)
  ),
  constraint notification_preferences_timezone_length check (char_length(timezone) between 1 and 64)
);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);
comment on table public.blocks is
  'Private hard boundaries. Either direction suppresses ordinary cross-user reads and direct-chat access.';

create table public.mutes (
  muter_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.mute_target_type not null,
  target_id uuid not null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (muter_id, target_type, target_id),
  constraint mutes_expiry check (expires_at is null or expires_at > created_at)
);
comment on table public.mutes is
  'Private feed/notification preferences. Target existence and feed filtering are application-managed to preserve soft-delete semantics.';

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason public.report_reason not null,
  details text not null default '',
  status public.report_status not null default 'open',
  resolution_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint reports_details_length check (char_length(details) <= 5000),
  constraint reports_resolution_length check (resolution_summary is null or char_length(resolution_summary) <= 2000),
  constraint reports_resolution_shape check (
    (status in ('resolved', 'dismissed') and resolved_at is not null)
    or (status in ('open', 'reviewing') and resolved_at is null)
  )
);
comment on table public.reports is
  'Reporter-private case intake. A reported user has no access merely by being the target.';

create table public.report_reviews (
  report_id uuid primary key references public.reports(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  internal_notes text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_reviews_notes_length check (char_length(internal_notes) <= 20000),
  constraint report_reviews_evidence_object check (jsonb_typeof(evidence) = 'object')
);
comment on table public.report_reviews is
  'Moderator-only report material, split from reports so reporters can never read internal notes through column projection mistakes.';

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references public.profiles(id) on delete restrict,
  report_id uuid references public.reports(id) on delete set null,
  target_type public.report_target_type not null,
  target_id uuid not null,
  action public.moderation_action_type not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  effective_until timestamptz,
  created_at timestamptz not null default now(),
  constraint moderation_actions_reason_length check (char_length(btrim(reason)) between 1 and 5000),
  constraint moderation_actions_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint moderation_actions_effective_until check (effective_until is null or effective_until > created_at)
);
comment on table public.moderation_actions is
  'Immutable moderator decision records. Enforcement changes are performed by a trusted backend in the same transaction, not inferred from this log.';

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  request_id text,
  ip_hash text,
  created_at timestamptz not null default now(),
  constraint audit_log_event_type_length check (char_length(event_type) between 1 and 120),
  constraint audit_log_entity_type_length check (char_length(entity_type) between 1 and 80),
  constraint audit_log_old_data_object check (old_data is null or jsonb_typeof(old_data) = 'object'),
  constraint audit_log_new_data_object check (new_data is null or jsonb_typeof(new_data) = 'object')
);
comment on table public.audit_log is
  'Append-only security/audit evidence. No browser role receives INSERT, UPDATE, or DELETE.';

create table public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action_key text not null,
  bucket_key_hash text not null,
  cost smallint not null default 1,
  outcome text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  constraint rate_limit_events_action_length check (char_length(action_key) between 1 and 100),
  constraint rate_limit_events_bucket_hash_length check (char_length(bucket_key_hash) between 16 and 256),
  constraint rate_limit_events_cost check (cost between 1 and 1000),
  constraint rate_limit_events_outcome check (outcome in ('allowed', 'denied')),
  constraint rate_limit_events_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint rate_limit_events_expiry check (expires_at > occurred_at)
);
comment on table public.rate_limit_events is
  'Trusted-server telemetry only. Store keyed hashes, not raw IP addresses; prune by expires_at.';

-- Foreign-key, timeline, policy, and full-text indexes.
create index profiles_role_idx on public.profiles (role) where role in ('moderator', 'admin');
create index profiles_visibility_idx on public.profiles (visibility, discoverability);
create index profiles_search_gin on public.profiles using gin (search_vector);
create index interests_kind_sort_idx on public.interests (kind, sort_order) where is_active;
create index interests_search_gin on public.interests using gin (search_vector);
create index profile_interests_interest_idx on public.profile_interests (interest_id, profile_id);
create index spaces_creator_idx on public.spaces (created_by);
create index spaces_interest_idx on public.spaces (primary_interest_id) where primary_interest_id is not null;
create index spaces_visibility_idx on public.spaces (visibility, is_archived);
create index spaces_search_gin on public.spaces using gin (search_vector);
create index space_memberships_user_idx on public.space_memberships (user_id, status);
create index space_memberships_active_role_idx on public.space_memberships (space_id, role) where status = 'active';
create index tags_search_gin on public.tags using gin (search_vector);
create index discussions_author_created_idx on public.discussions (author_id, created_at desc);
create index discussions_space_created_idx on public.discussions (space_id, created_at desc) where space_id is not null;
create index discussions_feed_idx on public.discussions (publication_state, moderation_state, created_at desc);
create index discussions_search_gin on public.discussions using gin (search_vector);
create index discussion_tags_tag_idx on public.discussion_tags (tag_id, discussion_id);
create index discussion_images_discussion_sort_idx on public.discussion_images (discussion_id, sort_order);
create index discussion_drafts_owner_updated_idx on public.discussion_drafts (owner_id, updated_at desc);
create index replies_discussion_created_idx on public.replies (discussion_id, created_at);
create index replies_parent_created_idx on public.replies (parent_reply_id, created_at) where parent_reply_id is not null;
create index replies_author_idx on public.replies (author_id, created_at desc);
create index replies_search_gin on public.replies using gin (search_vector);
create index discussion_reactions_user_idx on public.discussion_reactions (user_id, created_at desc);
create index reply_reactions_user_idx on public.reply_reactions (user_id, created_at desc);
create index saved_discussions_discussion_idx on public.saved_discussions (discussion_id);
create index follows_followed_idx on public.follows (followed_id, created_at desc);
create index chat_rooms_space_idx on public.chat_rooms (space_id) where space_id is not null;
create index chat_room_members_user_idx on public.chat_room_members (user_id, status);
create index chat_messages_room_created_idx on public.chat_messages (room_id, created_at desc);
create index chat_messages_sender_idx on public.chat_messages (sender_id, created_at desc);
create index chat_messages_reply_idx on public.chat_messages (reply_to_message_id) where reply_to_message_id is not null;
create index chat_messages_search_gin on public.chat_messages using gin (search_vector);
create index chat_message_reactions_user_idx on public.chat_message_reactions (user_id, created_at desc);
create index chat_read_states_message_idx on public.chat_read_states (last_read_message_id) where last_read_message_id is not null;
create index notifications_recipient_unread_idx on public.notifications (recipient_id, created_at desc) where read_at is null;
create index notifications_recipient_created_idx on public.notifications (recipient_id, created_at desc);
create index notifications_expires_idx on public.notifications (expires_at) where expires_at is not null;
create index blocks_blocked_idx on public.blocks (blocked_id, blocker_id);
create index mutes_target_idx on public.mutes (target_type, target_id);
create index mutes_expiry_idx on public.mutes (expires_at) where expires_at is not null;
create index reports_status_created_idx on public.reports (status, created_at);
create index reports_reporter_idx on public.reports (reporter_id, created_at desc);
create index reports_target_idx on public.reports (target_type, target_id, created_at desc);
create index report_reviews_assignee_idx on public.report_reviews (assigned_to) where assigned_to is not null;
create index moderation_actions_target_idx on public.moderation_actions (target_type, target_id, created_at desc);
create index moderation_actions_report_idx on public.moderation_actions (report_id) where report_id is not null;
create index moderation_actions_moderator_idx on public.moderation_actions (moderator_id, created_at desc);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id, created_at desc);
create index audit_log_actor_idx on public.audit_log (actor_id, created_at desc) where actor_id is not null;
create index audit_log_created_brin on public.audit_log using brin (created_at);
create index rate_limit_events_lookup_idx on public.rate_limit_events (bucket_key_hash, action_key, occurred_at desc);
create index rate_limit_events_user_idx on public.rate_limit_events (user_id, action_key, occurred_at desc) where user_id is not null;
create index rate_limit_events_expiry_idx on public.rate_limit_events (expires_at);
create index rate_limit_events_occurred_brin on public.rate_limit_events using brin (occurred_at);

-- Generic timestamp and edit markers.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := statement_timestamp();
  return new;
end;
$$;

create or replace function private.mark_discussion_edited()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.title is distinct from old.title or new.body is distinct from old.body then
    new.edited_at := statement_timestamp();
  end if;
  return new;
end;
$$;

create or replace function private.mark_reply_edited()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.body is distinct from old.body then
    new.edited_at := statement_timestamp();
  end if;
  return new;
end;
$$;

create or replace function private.mark_message_edited()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.body is distinct from old.body then
    new.edited_at := statement_timestamp();
  end if;
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger interests_set_updated_at before update on public.interests
  for each row execute function private.set_updated_at();
create trigger spaces_set_updated_at before update on public.spaces
  for each row execute function private.set_updated_at();
create trigger space_memberships_set_updated_at before update on public.space_memberships
  for each row execute function private.set_updated_at();
create trigger tags_set_updated_at before update on public.tags
  for each row execute function private.set_updated_at();
create trigger discussions_set_updated_at before update on public.discussions
  for each row execute function private.set_updated_at();
create trigger discussion_drafts_set_updated_at before update on public.discussion_drafts
  for each row execute function private.set_updated_at();
create trigger replies_set_updated_at before update on public.replies
  for each row execute function private.set_updated_at();
create trigger chat_rooms_set_updated_at before update on public.chat_rooms
  for each row execute function private.set_updated_at();
create trigger chat_room_members_set_updated_at before update on public.chat_room_members
  for each row execute function private.set_updated_at();
create trigger chat_messages_set_updated_at before update on public.chat_messages
  for each row execute function private.set_updated_at();
create trigger chat_read_states_set_updated_at before update on public.chat_read_states
  for each row execute function private.set_updated_at();
create trigger notification_preferences_set_updated_at before update on public.notification_preferences
  for each row execute function private.set_updated_at();
create trigger reports_set_updated_at before update on public.reports
  for each row execute function private.set_updated_at();
create trigger report_reviews_set_updated_at before update on public.report_reviews
  for each row execute function private.set_updated_at();

create trigger discussions_mark_edited before update on public.discussions
  for each row execute function private.mark_discussion_edited();
create trigger replies_mark_edited before update on public.replies
  for each row execute function private.mark_reply_edited();
create trigger chat_messages_mark_edited before update on public.chat_messages
  for each row execute function private.mark_message_edited();

-- Stable SECURITY DEFINER authorization helpers. All object names are qualified and
-- search_path is empty to prevent object-shadowing attacks.
create or replace function private.current_user_role()
returns public.account_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles as p
  where p.id = (select auth.uid())
    and (
      not p.is_suspended
      or (p.suspended_until is not null and p.suspended_until <= statement_timestamp())
    )
$$;

create or replace function private.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_user_role() in ('moderator', 'admin'), false)
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_user_role() = 'admin', false)
$$;

create or replace function private.is_blocked_between(first_user uuid, second_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when first_user is null or second_user is null or first_user = second_user then false
    else exists (
      select 1
      from public.blocks as b
      where (b.blocker_id = first_user and b.blocked_id = second_user)
         or (b.blocker_id = second_user and b.blocked_id = first_user)
    )
  end
$$;

create or replace function private.profile_role(profile_id uuid)
returns public.account_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles as p where p.id = profile_id
$$;

create or replace function private.can_view_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.profiles as p
    where p.id = profile_id
      and (
        p.id = (select auth.uid())
        or private.is_moderator()
        or (
          not private.is_blocked_between((select auth.uid()), p.id)
          and (
            p.visibility = 'public'
            or (p.visibility = 'members' and (select auth.uid()) is not null)
          )
        )
      )
  ), false)
$$;

create or replace function private.is_active_space_member(space_id uuid, member_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.space_memberships as sm
    where sm.space_id = is_active_space_member.space_id
      and sm.user_id = member_id
      and sm.status = 'active'
  ), false)
$$;

create or replace function private.can_moderate_space(space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_moderator()
    or coalesce(exists (
      select 1
      from public.space_memberships as sm
      where sm.space_id = can_moderate_space.space_id
        and sm.user_id = (select auth.uid())
        and sm.status = 'active'
        and sm.role in ('moderator', 'owner')
    ), false)
$$;

create or replace function private.can_view_space(space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.spaces as s
    where s.id = space_id
      and (
        s.created_by = (select auth.uid())
        or private.can_moderate_space(s.id)
        or (
          not s.is_archived
          and (
            s.visibility = 'public'
            or (s.visibility = 'members' and (select auth.uid()) is not null)
            or (s.visibility = 'private' and private.is_active_space_member(s.id))
          )
        )
      )
  ), false)
$$;

create or replace function private.can_create_in_space(space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when space_id is null then private.current_user_role() is not null
    else private.current_user_role() is not null
      and private.is_active_space_member(space_id)
      and exists (select 1 from public.spaces as s where s.id = space_id and not s.is_archived)
  end
$$;

create or replace function private.can_manage_discussion(discussion_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.discussions as d
    where d.id = discussion_id
      and (
        d.author_id = (select auth.uid())
        or (d.space_id is null and private.is_moderator())
        or (d.space_id is not null and private.can_moderate_space(d.space_id))
      )
  ), false)
$$;

create or replace function private.can_view_discussion(discussion_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.discussions as d
    where d.id = discussion_id
      and (
        d.author_id = (select auth.uid())
        or (d.space_id is null and private.is_moderator())
        or (d.space_id is not null and private.can_moderate_space(d.space_id))
        or (
          d.publication_state = 'published'
          and d.moderation_state = 'visible'
          and not private.is_blocked_between((select auth.uid()), d.author_id)
          and (d.space_id is null or private.can_view_space(d.space_id))
          and (
            d.visibility = 'public'
            or (d.visibility = 'members' and (select auth.uid()) is not null)
            or (d.visibility = 'space_members' and private.is_active_space_member(d.space_id))
          )
        )
      )
  ), false)
$$;

create or replace function private.can_view_reply(reply_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.replies as r
    join public.discussions as d on d.id = r.discussion_id
    where r.id = reply_id
      and (
        r.author_id = (select auth.uid())
        or (d.space_id is null and private.is_moderator())
        or (d.space_id is not null and private.can_moderate_space(d.space_id))
        or (
          r.publication_state = 'published'
          and r.moderation_state = 'visible'
          and private.can_view_discussion(r.discussion_id)
          and not private.is_blocked_between((select auth.uid()), r.author_id)
        )
      )
  ), false)
$$;

create or replace function private.is_chat_member(room_id uuid, member_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.chat_room_members as crm
    where crm.room_id = is_chat_member.room_id
      and crm.user_id = member_id
      and crm.status = 'active'
  ), false)
$$;

create or replace function private.can_moderate_chat(room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_moderator()
    or coalesce(exists (
      select 1
      from public.chat_room_members as crm
      join public.chat_rooms as cr on cr.id = crm.room_id
      where crm.room_id = can_moderate_chat.room_id
        and cr.room_type <> 'direct'
        and crm.user_id = (select auth.uid())
        and crm.status = 'active'
        and crm.role in ('moderator', 'owner')
    ), false)
$$;

create or replace function private.can_access_chat_room(room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.chat_rooms as cr
    where cr.id = room_id
      and (
        private.can_moderate_chat(cr.id)
        or (
          not cr.is_archived
          and private.current_user_role() is not null
          and private.is_chat_member(cr.id)
          and (
            cr.room_type <> 'direct'
            or not exists (
              select 1
              from public.chat_room_members as other_member
              where other_member.room_id = cr.id
                and other_member.status = 'active'
                and other_member.user_id <> (select auth.uid())
                and private.is_blocked_between((select auth.uid()), other_member.user_id)
            )
          )
        )
      )
  ), false)
$$;

create or replace function private.can_view_chat_message(message_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.chat_messages as cm
    where cm.id = message_id
      and private.can_access_chat_room(cm.room_id)
      and (
        cm.sender_id = (select auth.uid())
        or private.can_moderate_chat(cm.room_id)
        or (
          cm.publication_state = 'published'
          and cm.moderation_state = 'visible'
          and not private.is_blocked_between((select auth.uid()), cm.sender_id)
        )
      )
  ), false)
$$;

create or replace function private.can_add_chat_member(room_id uuid, candidate_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
      private.is_moderator()
      or exists (
        select 1
        from public.chat_room_members as manager
        where manager.room_id = can_add_chat_member.room_id
          and manager.user_id = (select auth.uid())
          and manager.status = 'active'
          and manager.role in ('moderator', 'owner')
      )
    )
    and not exists (
      select 1
      from public.chat_room_members as existing_member
      where existing_member.room_id = can_add_chat_member.room_id
        and existing_member.status in ('invited', 'active')
        and private.is_blocked_between(existing_member.user_id, candidate_id)
    )
$$;

create or replace function private.can_moderate_target(target_type public.report_target_type, target_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  related_space_id uuid;
  related_room_id uuid;
begin
  if private.is_moderator() then
    return true;
  end if;

  if target_type = 'space' then
    return private.can_moderate_space(target_id);
  elsif target_type = 'discussion' then
    select d.space_id into related_space_id from public.discussions as d where d.id = target_id;
    return related_space_id is not null and private.can_moderate_space(related_space_id);
  elsif target_type = 'reply' then
    select d.space_id into related_space_id
    from public.replies as r
    join public.discussions as d on d.id = r.discussion_id
    where r.id = target_id;
    return related_space_id is not null and private.can_moderate_space(related_space_id);
  elsif target_type = 'chat_room' then
    return private.can_moderate_chat(target_id);
  elsif target_type = 'chat_message' then
    select cm.room_id into related_room_id from public.chat_messages as cm where cm.id = target_id;
    return related_room_id is not null and private.can_moderate_chat(related_room_id);
  end if;

  -- Profile-level moderation is reserved for global moderators/admins.
  return false;
end;
$$;

create or replace function private.can_review_report(report_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(exists (
    select 1
    from public.reports as r
    where r.id = report_id
      and private.can_moderate_target(r.target_type, r.target_id)
  ), false)
$$;

create or replace function private.try_uuid(input text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  return input::uuid;
exception
  when invalid_text_representation then return null;
end;
$$;

-- Integrity and privilege guard triggers.
create or replace function private.guard_profile_privileged_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.role is distinct from old.role
     or new.is_suspended is distinct from old.is_suspended
     or new.suspended_until is distinct from old.suspended_until then
    raise exception 'profile role and suspension fields require a trusted backend'
      using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger profiles_guard_privileged_fields
  before update on public.profiles
  for each row execute function private.guard_profile_privileged_fields();

create or replace function private.add_space_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.space_memberships (
    space_id, user_id, role, status, joined_by, joined_at
  ) values (
    new.id, new.created_by, 'owner', 'active', new.created_by, statement_timestamp()
  );
  return new;
end;
$$;
create trigger spaces_add_owner_membership
  after insert on public.spaces
  for each row execute function private.add_space_owner_membership();

create or replace function private.guard_space_membership_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  viewer uuid := auth.uid();
  viewer_can_moderate boolean;
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    if tg_op = 'DELETE' then
      return old;
    end if;
    if tg_op = 'UPDATE' and new.status = 'active' and new.joined_at is null then
      new.joined_at := statement_timestamp();
    end if;
    return new;
  end if;

  viewer_can_moderate := private.can_moderate_space(old.space_id);

  if old.role = 'owner' and not private.is_admin() then
    raise exception 'only a trusted administrator can alter or remove a space owner'
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    if old.user_id <> viewer and not viewer_can_moderate then
      raise exception 'not permitted to remove this membership' using errcode = '42501';
    end if;
    return old;
  end if;

  if new.space_id is distinct from old.space_id or new.user_id is distinct from old.user_id then
    raise exception 'membership identity is immutable' using errcode = '23514';
  end if;

  if new.role = 'owner' and not private.is_admin() then
    raise exception 'only a trusted administrator can assign space ownership'
      using errcode = '42501';
  end if;

  if old.user_id = viewer and not viewer_can_moderate then
    if new.role is distinct from old.role or new.joined_by is distinct from old.joined_by then
      raise exception 'members cannot change their own role or inviter' using errcode = '42501';
    end if;
    if not (
      new.status = old.status
      or (old.status = 'invited' and new.status in ('active', 'left'))
      or (old.status in ('pending', 'active') and new.status = 'left')
    ) then
      raise exception 'invalid self-service membership transition' using errcode = '23514';
    end if;
  elsif not viewer_can_moderate then
    raise exception 'membership changes require a space moderator' using errcode = '42501';
  end if;

  if new.status = 'active' and (old.status <> 'active' or new.joined_at is null) then
    new.joined_at := statement_timestamp();
  end if;
  return new;
end;
$$;
create trigger space_memberships_guard_change
  before update or delete on public.space_memberships
  for each row execute function private.guard_space_membership_change();

create or replace function private.set_reply_depth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_depth smallint;
  parent_discussion uuid;
begin
  if tg_op = 'UPDATE'
     and (new.discussion_id is distinct from old.discussion_id
          or new.parent_reply_id is distinct from old.parent_reply_id
          or new.author_id is distinct from old.author_id) then
    raise exception 'reply thread identity is immutable' using errcode = '23514';
  end if;

  if new.parent_reply_id is null then
    new.depth := 0;
    return new;
  end if;

  select r.depth, r.discussion_id
    into parent_depth, parent_discussion
  from public.replies as r
  where r.id = new.parent_reply_id;

  if not found or parent_discussion <> new.discussion_id then
    raise exception 'parent reply must belong to the same discussion' using errcode = '23503';
  end if;
  if parent_depth >= 8 then
    raise exception 'reply nesting cannot exceed eight levels' using errcode = '23514';
  end if;

  new.depth := parent_depth + 1;
  return new;
end;
$$;
create trigger replies_set_depth
  before insert or update on public.replies
  for each row execute function private.set_reply_depth();

create or replace function private.add_chat_room_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.chat_room_members (
    room_id, user_id, role, status, invited_by, joined_at
  ) values (
    new.id, new.created_by, 'owner', 'active', new.created_by, statement_timestamp()
  );
  return new;
end;
$$;
create trigger chat_rooms_add_owner
  after insert on public.chat_rooms
  for each row execute function private.add_chat_room_owner();

create or replace function private.validate_chat_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_room_type public.chat_room_type;
  target_direct_key text;
  member_count integer;
  existing_user_id uuid;
  expected_direct_key text;
begin
  select cr.room_type, cr.direct_key into target_room_type, target_direct_key
  from public.chat_rooms as cr
  where cr.id = new.room_id;

  if target_room_type = 'direct' then
    select count(*) into member_count
    from public.chat_room_members as crm
    where crm.room_id = new.room_id
      and crm.status in ('invited', 'active')
      and crm.user_id <> new.user_id;

    if member_count >= 2 then
      raise exception 'direct rooms may have only two invited or active members' using errcode = '23514';
    end if;
    if new.role = 'moderator' then
      raise exception 'direct rooms do not support a moderator membership role' using errcode = '23514';
    end if;
    if exists (
      select 1 from public.chat_room_members as crm
      where crm.room_id = new.room_id
        and crm.status in ('invited', 'active')
        and private.is_blocked_between(crm.user_id, new.user_id)
    ) then
      raise exception 'blocked users cannot share a direct room' using errcode = '42501';
    end if;

    if member_count = 1 then
      select crm.user_id into existing_user_id
      from public.chat_room_members as crm
      where crm.room_id = new.room_id
        and crm.status in ('invited', 'active')
        and crm.user_id <> new.user_id
      order by crm.created_at
      limit 1;

      expected_direct_key := least(existing_user_id::text, new.user_id::text)
        || ':' || greatest(existing_user_id::text, new.user_id::text);
      if target_direct_key <> expected_direct_key then
        raise exception 'direct room key does not match its two members' using errcode = '23514';
      end if;
    end if;
  end if;
  return new;
end;
$$;
create trigger chat_room_members_validate_insert
  before insert on public.chat_room_members
  for each row execute function private.validate_chat_membership();

create or replace function private.guard_chat_membership_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  viewer uuid := auth.uid();
  viewer_can_moderate boolean;
  target_room_type public.chat_room_type;
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    if tg_op = 'DELETE' then
      return old;
    end if;
    if tg_op = 'UPDATE' and new.status = 'active' and new.joined_at is null then
      new.joined_at := statement_timestamp();
    end if;
    return new;
  end if;

  viewer_can_moderate := private.can_moderate_chat(old.room_id);

  if old.role = 'owner' and not private.is_admin() then
    raise exception 'only a trusted administrator can alter or remove a room owner'
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    if old.user_id <> viewer and not viewer_can_moderate then
      raise exception 'not permitted to remove this room membership' using errcode = '42501';
    end if;
    return old;
  end if;

  if new.room_id is distinct from old.room_id or new.user_id is distinct from old.user_id then
    raise exception 'room membership identity is immutable' using errcode = '23514';
  end if;
  if new.role = 'owner' and not private.is_admin() then
    raise exception 'only a trusted administrator can assign room ownership'
      using errcode = '42501';
  end if;

  select cr.room_type into target_room_type from public.chat_rooms as cr where cr.id = old.room_id;
  if target_room_type = 'direct' and new.role = 'moderator' then
    raise exception 'direct rooms do not support a moderator membership role' using errcode = '23514';
  end if;

  if old.user_id = viewer and not viewer_can_moderate then
    if new.role is distinct from old.role or new.invited_by is distinct from old.invited_by then
      raise exception 'members cannot change their own room role or inviter' using errcode = '42501';
    end if;
    if not (
      new.status = old.status
      or (old.status = 'invited' and new.status in ('active', 'left'))
      or (old.status = 'active' and new.status = 'left')
    ) then
      raise exception 'invalid self-service room membership transition' using errcode = '23514';
    end if;
  elsif not viewer_can_moderate then
    raise exception 'room membership changes require a room moderator' using errcode = '42501';
  end if;

  if new.status = 'active' and (old.status <> 'active' or new.joined_at is null) then
    new.joined_at := statement_timestamp();
  end if;
  return new;
end;
$$;
create trigger chat_room_members_guard_change
  before update or delete on public.chat_room_members
  for each row execute function private.guard_chat_membership_change();

create or replace function private.validate_message_reply()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_room_id uuid;
begin
  if tg_op = 'UPDATE'
     and (new.room_id is distinct from old.room_id
          or new.sender_id is distinct from old.sender_id
          or new.reply_to_message_id is distinct from old.reply_to_message_id) then
    raise exception 'message identity and reply target are immutable' using errcode = '23514';
  end if;

  if new.reply_to_message_id is not null then
    select cm.room_id into parent_room_id
    from public.chat_messages as cm
    where cm.id = new.reply_to_message_id;
    if not found or parent_room_id <> new.room_id then
      raise exception 'replied-to message must belong to the same room' using errcode = '23503';
    end if;
  end if;
  return new;
end;
$$;
create trigger chat_messages_validate_reply
  before insert or update on public.chat_messages
  for each row execute function private.validate_message_reply();

create or replace function private.remove_blocked_social_edges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.follows
  where (follower_id = new.blocker_id and followed_id = new.blocked_id)
     or (follower_id = new.blocked_id and followed_id = new.blocker_id);
  return new;
end;
$$;
create trigger blocks_remove_social_edges
  after insert on public.blocks
  for each row execute function private.remove_blocked_social_edges();

create or replace function private.validate_polymorphic_target()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_exists boolean := false;
begin
  case new.target_type
    when 'profile' then select exists (select 1 from public.profiles p where p.id = new.target_id) into target_exists;
    when 'space' then select exists (select 1 from public.spaces s where s.id = new.target_id) into target_exists;
    when 'discussion' then select exists (select 1 from public.discussions d where d.id = new.target_id) into target_exists;
    when 'reply' then select exists (select 1 from public.replies r where r.id = new.target_id) into target_exists;
    when 'chat_room' then select exists (select 1 from public.chat_rooms cr where cr.id = new.target_id) into target_exists;
    when 'chat_message' then select exists (select 1 from public.chat_messages cm where cm.id = new.target_id) into target_exists;
  end case;

  if not target_exists then
    raise exception 'moderation target does not exist' using errcode = '23503';
  end if;
  return new;
end;
$$;
create trigger reports_validate_target
  before insert or update of target_type, target_id on public.reports
  for each row execute function private.validate_polymorphic_target();
create trigger moderation_actions_validate_target
  before insert on public.moderation_actions
  for each row execute function private.validate_polymorphic_target();

create or replace function private.audit_moderation_action()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_log (actor_id, event_type, entity_type, entity_id, new_data)
  values (
    new.moderator_id,
    'moderation.action_created',
    new.target_type::text,
    new.target_id,
    jsonb_build_object(
      'action_id', new.id,
      'action', new.action,
      'report_id', new.report_id,
      'effective_until', new.effective_until
    )
  );
  return new;
end;
$$;

create or replace function private.audit_report_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.audit_log (actor_id, event_type, entity_type, entity_id, old_data, new_data)
    values (
      auth.uid(),
      'report.status_changed',
      'report',
      new.id,
      jsonb_build_object('status', old.status, 'resolved_at', old.resolved_at),
      jsonb_build_object('status', new.status, 'resolved_at', new.resolved_at)
    );
  end if;
  return new;
end;
$$;

create or replace function private.audit_profile_privilege()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     or new.is_suspended is distinct from old.is_suspended
     or new.suspended_until is distinct from old.suspended_until then
    insert into public.audit_log (actor_id, event_type, entity_type, entity_id, old_data, new_data)
    values (
      auth.uid(),
      'profile.privilege_changed',
      'profile',
      new.id,
      jsonb_build_object('role', old.role, 'is_suspended', old.is_suspended, 'suspended_until', old.suspended_until),
      jsonb_build_object('role', new.role, 'is_suspended', new.is_suspended, 'suspended_until', new.suspended_until)
    );
  end if;
  return new;
end;
$$;

create trigger moderation_actions_write_audit
  after insert on public.moderation_actions
  for each row execute function private.audit_moderation_action();
create trigger reports_write_audit
  after update on public.reports
  for each row execute function private.audit_report_status();
create trigger profiles_write_privilege_audit
  after update on public.profiles
  for each row execute function private.audit_profile_privilege();

-- Auth signup bootstrap. The generated suffix guarantees uniqueness without trusting
-- user metadata. raw_user_meta_data may provide display text but can never provide role.
create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  username_base text;
  generated_username text;
  generated_display_name text;
begin
  username_base := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email, ''), '@', 1), 'member'),
    '[^a-zA-Z0-9_-]+', '-', 'g'
  ));
  username_base := trim(both '-' from username_base);
  username_base := regexp_replace(username_base, '^[^a-z0-9]+', '');
  if char_length(username_base) < 3 then
    username_base := 'member';
  end if;
  generated_username := left(username_base, 23) || '-' || replace(new.id::text, '-', '');
  generated_display_name := left(
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), 'New Manywise member'),
    80
  );

  insert into public.profiles (id, username, display_name, role)
  values (new.id, generated_username, generated_display_name, 'member')
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists manywise_on_auth_user_created on auth.users;
create trigger manywise_on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

-- Row-level security. Helpers bypass recursive policy evaluation but return only
-- authorization decisions; table rows remain protected by each table's own policy.
alter table public.profiles enable row level security;
alter table public.interests enable row level security;
alter table public.profile_interests enable row level security;
alter table public.spaces enable row level security;
alter table public.space_memberships enable row level security;
alter table public.tags enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_tags enable row level security;
alter table public.discussion_images enable row level security;
alter table public.discussion_drafts enable row level security;
alter table public.replies enable row level security;
alter table public.discussion_reactions enable row level security;
alter table public.reply_reactions enable row level security;
alter table public.saved_discussions enable row level security;
alter table public.follows enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_room_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_message_reactions enable row level security;
alter table public.chat_read_states enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.blocks enable row level security;
alter table public.mutes enable row level security;
alter table public.reports enable row level security;
alter table public.report_reviews enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.audit_log enable row level security;
alter table public.rate_limit_events enable row level security;

create policy profiles_select_visible on public.profiles
  for select to anon, authenticated
  using (private.can_view_profile(id));
create policy profiles_insert_self_member on public.profiles
  for insert to authenticated
  with check (
    id = (select auth.uid())
    and role = 'member'
    and not is_suspended
    and suspended_until is null
  );
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = private.profile_role(id)
  );

create policy interests_select_active on public.interests
  for select to anon, authenticated
  using (is_active or private.is_moderator());
create policy interests_manage_moderator on public.interests
  for all to authenticated
  using (private.is_moderator())
  with check (private.is_moderator());

create policy profile_interests_select_visible on public.profile_interests
  for select to anon, authenticated
  using (private.can_view_profile(profile_id));
create policy profile_interests_insert_self on public.profile_interests
  for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy profile_interests_update_self on public.profile_interests
  for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
create policy profile_interests_delete_self on public.profile_interests
  for delete to authenticated
  using (profile_id = (select auth.uid()));

create policy spaces_select_visible on public.spaces
  for select to anon, authenticated
  using (private.can_view_space(id));
create policy spaces_insert_member on public.spaces
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and private.current_user_role() is not null
  );
create policy spaces_update_manager on public.spaces
  for update to authenticated
  using (created_by = (select auth.uid()) or private.can_moderate_space(id))
  with check (created_by = (select auth.uid()) or private.can_moderate_space(id));
create policy spaces_delete_admin on public.spaces
  for delete to authenticated
  using (private.is_admin());

create policy space_memberships_select_visible on public.space_memberships
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.can_moderate_space(space_id)
    or (
      status = 'active'
      and private.can_view_space(space_id)
      and private.can_view_profile(user_id)
    )
  );
create policy space_memberships_insert on public.space_memberships
  for insert to authenticated
  with check (
    (
      user_id = (select auth.uid())
      and role = 'member'
      and exists (
        select 1 from public.spaces as s
        where s.id = space_id
          and not s.is_archived
          and s.visibility <> 'private'
          and (
            (s.join_policy = 'open' and status = 'active')
            or (s.join_policy = 'request' and status = 'pending')
          )
          and not private.is_blocked_between((select auth.uid()), s.created_by)
      )
    )
    or (
      private.can_moderate_space(space_id)
      and role <> 'owner'
      and status in ('invited', 'pending', 'active', 'banned')
    )
    or private.is_admin()
  );
create policy space_memberships_update on public.space_memberships
  for update to authenticated
  using (user_id = (select auth.uid()) or private.can_moderate_space(space_id))
  with check (user_id = (select auth.uid()) or private.can_moderate_space(space_id));
create policy space_memberships_delete on public.space_memberships
  for delete to authenticated
  using (user_id = (select auth.uid()) or private.can_moderate_space(space_id));

create policy tags_select_active on public.tags
  for select to anon, authenticated
  using (is_active or private.is_moderator());
create policy tags_manage_moderator on public.tags
  for all to authenticated
  using (private.is_moderator())
  with check (private.is_moderator());

create policy discussions_select_visible on public.discussions
  for select to anon, authenticated
  using (private.can_view_discussion(id));
create policy discussions_insert_author on public.discussions
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and private.can_create_in_space(space_id)
    and publication_state = 'published'
    and moderation_state in ('visible', 'pending_review')
    and (
      visibility <> 'private'
      or author_id = (select auth.uid())
    )
  );
create policy discussions_update_author on public.discussions
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy discussion_tags_select_visible on public.discussion_tags
  for select to anon, authenticated
  using (private.can_view_discussion(discussion_id));
create policy discussion_tags_insert_manager on public.discussion_tags
  for insert to authenticated
  with check (private.can_manage_discussion(discussion_id));
create policy discussion_tags_delete_manager on public.discussion_tags
  for delete to authenticated
  using (private.can_manage_discussion(discussion_id));

create policy discussion_images_select_visible on public.discussion_images
  for select to anon, authenticated
  using (private.can_view_discussion(discussion_id));
create policy discussion_images_insert_manager on public.discussion_images
  for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and private.can_manage_discussion(discussion_id)
  );
create policy discussion_images_update_manager on public.discussion_images
  for update to authenticated
  using (private.can_manage_discussion(discussion_id))
  with check (private.can_manage_discussion(discussion_id));
create policy discussion_images_delete_manager on public.discussion_images
  for delete to authenticated
  using (private.can_manage_discussion(discussion_id));

create policy discussion_drafts_select_owner_or_global_moderator on public.discussion_drafts
  for select to authenticated
  using (owner_id = (select auth.uid()) or private.is_moderator());
create policy discussion_drafts_insert_owner on public.discussion_drafts
  for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy discussion_drafts_update_owner on public.discussion_drafts
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy discussion_drafts_delete_owner on public.discussion_drafts
  for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy replies_select_visible on public.replies
  for select to anon, authenticated
  using (private.can_view_reply(id));
create policy replies_insert_author on public.replies
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and private.current_user_role() is not null
    and private.can_view_discussion(discussion_id)
    and publication_state = 'published'
    and moderation_state in ('visible', 'pending_review')
  );
create policy replies_update_author on public.replies
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy discussion_reactions_select_visible on public.discussion_reactions
  for select to anon, authenticated
  using (
    private.can_view_discussion(discussion_id)
    and private.can_view_profile(user_id)
  );
create policy discussion_reactions_insert_self on public.discussion_reactions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and private.can_view_discussion(discussion_id)
  );
create policy discussion_reactions_delete_self on public.discussion_reactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy reply_reactions_select_visible on public.reply_reactions
  for select to anon, authenticated
  using (private.can_view_reply(reply_id) and private.can_view_profile(user_id));
create policy reply_reactions_insert_self on public.reply_reactions
  for insert to authenticated
  with check (user_id = (select auth.uid()) and private.can_view_reply(reply_id));
create policy reply_reactions_delete_self on public.reply_reactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy saved_discussions_select_self on public.saved_discussions
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy saved_discussions_insert_self on public.saved_discussions
  for insert to authenticated
  with check (user_id = (select auth.uid()) and private.can_view_discussion(discussion_id));
create policy saved_discussions_delete_self on public.saved_discussions
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy follows_select_visible on public.follows
  for select to authenticated
  using (
    follower_id = (select auth.uid())
    or followed_id = (select auth.uid())
    or (
      not private.is_blocked_between(follower_id, followed_id)
      and private.can_view_profile(follower_id)
      and private.can_view_profile(followed_id)
    )
  );
create policy follows_insert_self on public.follows
  for insert to authenticated
  with check (
    follower_id = (select auth.uid())
    and private.can_view_profile(followed_id)
    and not private.is_blocked_between(follower_id, followed_id)
  );
create policy follows_delete_self on public.follows
  for delete to authenticated
  using (follower_id = (select auth.uid()));

create policy chat_rooms_select_member on public.chat_rooms
  for select to authenticated
  using (private.can_access_chat_room(id));
create policy chat_rooms_insert_member on public.chat_rooms
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and private.current_user_role() is not null
    and (space_id is null or private.is_active_space_member(space_id))
  );
create policy chat_rooms_update_manager on public.chat_rooms
  for update to authenticated
  using (private.can_moderate_chat(id))
  with check (private.can_moderate_chat(id));
create policy chat_rooms_delete_admin on public.chat_rooms
  for delete to authenticated
  using (private.is_admin());

create policy chat_room_members_select_room on public.chat_room_members
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.can_moderate_chat(room_id)
    or (
      private.can_access_chat_room(room_id)
      and private.can_view_profile(user_id)
    )
  );
create policy chat_room_members_insert_manager on public.chat_room_members
  for insert to authenticated
  with check (
    private.can_add_chat_member(room_id, user_id)
    and role <> 'owner'
    and status in ('invited', 'active')
  );
create policy chat_room_members_update on public.chat_room_members
  for update to authenticated
  using (user_id = (select auth.uid()) or private.can_moderate_chat(room_id))
  with check (user_id = (select auth.uid()) or private.can_moderate_chat(room_id));
create policy chat_room_members_delete on public.chat_room_members
  for delete to authenticated
  using (user_id = (select auth.uid()) or private.can_moderate_chat(room_id));

create policy chat_messages_select_room on public.chat_messages
  for select to authenticated
  using (private.can_view_chat_message(id));
create policy chat_messages_insert_sender on public.chat_messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and private.can_access_chat_room(room_id)
    and publication_state = 'published'
    and moderation_state in ('visible', 'pending_review')
  );
create policy chat_messages_update_sender on public.chat_messages
  for update to authenticated
  using (sender_id = (select auth.uid()) and private.can_access_chat_room(room_id))
  with check (sender_id = (select auth.uid()) and private.can_access_chat_room(room_id));

create policy chat_message_reactions_select_room on public.chat_message_reactions
  for select to authenticated
  using (private.can_view_chat_message(message_id) and private.can_view_profile(user_id));
create policy chat_message_reactions_insert_self on public.chat_message_reactions
  for insert to authenticated
  with check (user_id = (select auth.uid()) and private.can_view_chat_message(message_id));
create policy chat_message_reactions_delete_self on public.chat_message_reactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy chat_read_states_select_room on public.chat_read_states
  for select to authenticated
  using (
    private.can_access_chat_room(room_id)
    and (
      user_id = (select auth.uid())
      or private.can_moderate_chat(room_id)
      or not private.is_blocked_between((select auth.uid()), user_id)
    )
  );
create policy chat_read_states_insert_self on public.chat_read_states
  for insert to authenticated
  with check (user_id = (select auth.uid()) and private.can_access_chat_room(room_id));
create policy chat_read_states_update_self on public.chat_read_states
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and private.can_access_chat_room(room_id));
create policy chat_read_states_delete_self on public.chat_read_states
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy notifications_select_self on public.notifications
  for select to authenticated
  using (
    recipient_id = (select auth.uid())
    and (actor_id is null or not private.is_blocked_between(recipient_id, actor_id))
  );
create policy notifications_update_self on public.notifications
  for update to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));
create policy notifications_delete_self on public.notifications
  for delete to authenticated
  using (recipient_id = (select auth.uid()));

create policy notification_preferences_select_self on public.notification_preferences
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy notification_preferences_insert_self on public.notification_preferences
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy notification_preferences_update_self on public.notification_preferences
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy blocks_select_self on public.blocks
  for select to authenticated
  using (blocker_id = (select auth.uid()));
create policy blocks_insert_self on public.blocks
  for insert to authenticated
  with check (blocker_id = (select auth.uid()));
create policy blocks_delete_self on public.blocks
  for delete to authenticated
  using (blocker_id = (select auth.uid()));

create policy mutes_select_self on public.mutes
  for select to authenticated
  using (muter_id = (select auth.uid()));
create policy mutes_insert_self on public.mutes
  for insert to authenticated
  with check (muter_id = (select auth.uid()));
create policy mutes_update_self on public.mutes
  for update to authenticated
  using (muter_id = (select auth.uid()))
  with check (muter_id = (select auth.uid()));
create policy mutes_delete_self on public.mutes
  for delete to authenticated
  using (muter_id = (select auth.uid()));

create policy reports_insert_reporter on public.reports
  for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and status = 'open'
    and resolved_at is null
    and resolution_summary is null
  );
create policy reports_select_private on public.reports
  for select to authenticated
  using (
    reporter_id = (select auth.uid())
    or private.can_moderate_target(target_type, target_id)
  );
create policy reports_update_moderator on public.reports
  for update to authenticated
  using (private.can_moderate_target(target_type, target_id))
  with check (private.can_moderate_target(target_type, target_id));

create policy report_reviews_select_moderator on public.report_reviews
  for select to authenticated
  using (private.can_review_report(report_id));
create policy report_reviews_insert_moderator on public.report_reviews
  for insert to authenticated
  with check (private.can_review_report(report_id));
create policy report_reviews_update_moderator on public.report_reviews
  for update to authenticated
  using (private.can_review_report(report_id))
  with check (private.can_review_report(report_id));
create policy report_reviews_delete_admin on public.report_reviews
  for delete to authenticated
  using (private.is_admin());

create policy moderation_actions_select_moderator on public.moderation_actions
  for select to authenticated
  using (private.can_moderate_target(target_type, target_id));
create policy moderation_actions_insert_moderator on public.moderation_actions
  for insert to authenticated
  with check (
    moderator_id = (select auth.uid())
    and private.can_moderate_target(target_type, target_id)
  );

create policy audit_log_select_global_moderator on public.audit_log
  for select to authenticated
  using (private.is_moderator());

create policy rate_limit_events_select_admin on public.rate_limit_events
  for select to authenticated
  using (private.is_admin());

-- RLS-aware search. SECURITY INVOKER is deliberate: each branch remains constrained
-- by the caller's table policy, and hidden discoverability is additionally excluded.
create or replace function public.search_manywise(search_query text, result_limit integer default 20)
returns table (
  result_type text,
  result_id uuid,
  container_id uuid,
  title text,
  snippet text,
  rank real
)
language sql
stable
security invoker
set search_path = ''
as $$
  with query as (
    select websearch_to_tsquery('english'::regconfig, nullif(btrim(search_query), '')) as value
  ), results as (
    select
      'profile'::text as result_type,
      p.id as result_id,
      null::uuid as container_id,
      p.display_name as title,
      ts_headline('english'::regconfig, coalesce(p.bio, ''), query.value,
        'MaxWords=28, MinWords=8, ShortWord=3') as snippet,
      ts_rank_cd(p.search_vector, query.value)::real as rank
    from public.profiles as p cross join query
    where query.value is not null
      and p.search_vector @@ query.value
      and (
        p.id = (select auth.uid())
        or private.is_moderator()
        or p.discoverability = 'listed'
        or (p.discoverability = 'suggestions_only' and (select auth.uid()) is not null)
      )
    union all
    select
      'space', s.id, null::uuid, s.name,
      ts_headline('english'::regconfig, concat_ws(' ', s.summary, s.description), query.value,
        'MaxWords=28, MinWords=8, ShortWord=3'),
      ts_rank_cd(s.search_vector, query.value)::real
    from public.spaces as s cross join query
    where query.value is not null and s.search_vector @@ query.value
    union all
    select
      'discussion', d.id, d.space_id, d.title,
      ts_headline('english'::regconfig, d.body, query.value,
        'MaxWords=32, MinWords=10, ShortWord=3'),
      ts_rank_cd(d.search_vector, query.value)::real
    from public.discussions as d cross join query
    where query.value is not null and d.search_vector @@ query.value
    union all
    select
      'reply', r.id, r.discussion_id, 'Reply'::text,
      ts_headline('english'::regconfig, r.body, query.value,
        'MaxWords=32, MinWords=10, ShortWord=3'),
      ts_rank_cd(r.search_vector, query.value)::real
    from public.replies as r cross join query
    where query.value is not null and r.search_vector @@ query.value
  )
  select results.result_type, results.result_id, results.container_id,
         results.title, results.snippet, results.rank
  from results
  order by results.rank desc, results.result_type, results.title
  limit least(greatest(coalesce(result_limit, 20), 1), 50)
$$;
comment on function public.search_manywise(text, integer) is
  'RLS-aware full-text search across discoverable profiles, visible spaces, discussions, and replies.';

-- Privileges: revoke broad defaults, then grant only operations used by clients.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.search_manywise(text, integer) from public;

grant usage on schema public to anon, authenticated;
grant usage on schema private to anon, authenticated;

grant select on public.profiles, public.interests, public.profile_interests,
  public.spaces, public.tags, public.discussions, public.discussion_tags,
  public.discussion_images, public.replies, public.discussion_reactions,
  public.reply_reactions to anon;

grant select on public.profiles, public.interests, public.profile_interests,
  public.spaces, public.space_memberships, public.tags, public.discussions,
  public.discussion_tags, public.discussion_images, public.discussion_drafts,
  public.replies, public.discussion_reactions, public.reply_reactions,
  public.saved_discussions, public.follows, public.chat_rooms,
  public.chat_room_members, public.chat_messages, public.chat_message_reactions,
  public.chat_read_states, public.notifications, public.notification_preferences,
  public.blocks, public.mutes, public.reports, public.report_reviews,
  public.moderation_actions, public.audit_log, public.rate_limit_events
  to authenticated;

grant insert (id, username, display_name, bio, pronouns, location, avatar_path,
  visibility, discoverability, onboarding_state, onboarding_completed_at, last_seen_at)
  on public.profiles to authenticated;
grant update (username, display_name, bio, pronouns, location, avatar_path,
  visibility, discoverability, onboarding_state, onboarding_completed_at, last_seen_at)
  on public.profiles to authenticated;

grant insert, update, delete on public.interests to authenticated;
grant insert, update, delete on public.profile_interests to authenticated;
grant insert (id, created_by, primary_interest_id, slug, name, summary, description,
  visibility, join_policy) on public.spaces to authenticated;
grant update (primary_interest_id, slug, name, summary, description, visibility, join_policy, is_archived)
  on public.spaces to authenticated;
grant delete on public.spaces to authenticated;
grant insert (space_id, user_id, role, status, joined_by, joined_at)
  on public.space_memberships to authenticated;
grant update (role, status) on public.space_memberships to authenticated;
grant delete on public.space_memberships to authenticated;
grant insert, update, delete on public.tags to authenticated;
grant insert (id, author_id, space_id, title, body, visibility, content_warning)
  on public.discussions to authenticated;
grant update (title, body, visibility, publication_state, content_warning)
  on public.discussions to authenticated;
grant insert, delete on public.discussion_tags to authenticated;
grant insert (id, discussion_id, uploaded_by, storage_path, alt_text, width, height, sort_order)
  on public.discussion_images to authenticated;
grant update (alt_text, sort_order) on public.discussion_images to authenticated;
grant delete on public.discussion_images to authenticated;
grant insert, update, delete on public.discussion_drafts to authenticated;
grant insert (id, discussion_id, author_id, parent_reply_id, body)
  on public.replies to authenticated;
grant update (body, publication_state) on public.replies to authenticated;
grant insert, delete on public.discussion_reactions, public.reply_reactions,
  public.saved_discussions, public.follows to authenticated;
grant insert (id, room_type, created_by, space_id, title, topic, direct_key)
  on public.chat_rooms to authenticated;
grant update (title, topic, is_archived) on public.chat_rooms to authenticated;
grant delete on public.chat_rooms to authenticated;
grant insert (room_id, user_id, role, status, invited_by, joined_at)
  on public.chat_room_members to authenticated;
grant update (role, status) on public.chat_room_members to authenticated;
grant delete on public.chat_room_members to authenticated;
grant insert (id, room_id, sender_id, reply_to_message_id, body)
  on public.chat_messages to authenticated;
grant update (body, publication_state) on public.chat_messages to authenticated;
grant insert, delete on public.chat_message_reactions to authenticated;
grant insert (room_id, user_id, last_read_message_id, last_read_at)
  on public.chat_read_states to authenticated;
grant update (last_read_message_id, last_read_at) on public.chat_read_states to authenticated;
grant delete on public.chat_read_states to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant delete on public.notifications to authenticated;
grant insert (user_id) on public.notification_preferences to authenticated;
grant update (in_app_enabled, email_enabled, push_enabled, follows_enabled,
  discussion_activity_enabled, chat_enabled, moderation_enabled, digest_frequency,
  quiet_hours_start, quiet_hours_end, timezone)
  on public.notification_preferences to authenticated;
grant insert, delete on public.blocks to authenticated;
grant insert, update, delete on public.mutes to authenticated;
grant insert (reporter_id, target_type, target_id, reason, details)
  on public.reports to authenticated;
grant update (status, resolution_summary, resolved_at) on public.reports to authenticated;
grant insert, update, delete on public.report_reviews to authenticated;
grant insert (moderator_id, report_id, target_type, target_id, action, reason, metadata, effective_until)
  on public.moderation_actions to authenticated;

-- Policies invoke these named helpers. The private schema is not exposed as an API
-- schema, so these grants do not create PostgREST RPC endpoints.
grant execute on function private.current_user_role() to anon, authenticated;
grant execute on function private.is_moderator() to anon, authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_blocked_between(uuid, uuid) to anon, authenticated;
grant execute on function private.profile_role(uuid) to authenticated;
grant execute on function private.can_view_profile(uuid) to anon, authenticated;
grant execute on function private.is_active_space_member(uuid, uuid) to anon, authenticated;
grant execute on function private.can_moderate_space(uuid) to anon, authenticated;
grant execute on function private.can_view_space(uuid) to anon, authenticated;
grant execute on function private.can_create_in_space(uuid) to authenticated;
grant execute on function private.can_manage_discussion(uuid) to authenticated;
grant execute on function private.can_view_discussion(uuid) to anon, authenticated;
grant execute on function private.can_view_reply(uuid) to anon, authenticated;
grant execute on function private.is_chat_member(uuid, uuid) to authenticated;
grant execute on function private.can_moderate_chat(uuid) to authenticated;
grant execute on function private.can_access_chat_room(uuid) to authenticated;
grant execute on function private.can_view_chat_message(uuid) to authenticated;
grant execute on function private.can_add_chat_member(uuid, uuid) to authenticated;
grant execute on function private.can_moderate_target(public.report_target_type, uuid) to authenticated;
grant execute on function private.can_review_report(uuid) to authenticated;
grant execute on function private.try_uuid(text) to anon, authenticated;
grant execute on function public.search_manywise(text, integer) to anon, authenticated;

-- Trusted deployment/server role. RLS remains the browser boundary; service_role is
-- deliberately not granted to browser users and no credentials are embedded here.
grant usage on schema public, private to service_role;
grant all privileges on all tables in schema public to service_role;
grant execute on all functions in schema public, private to service_role;

-- Ensure future objects created by this migration owner do not accidentally become
-- callable through PostgreSQL's default PUBLIC function privilege.
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from public;
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- Private Storage buckets. Object names are the authorization boundary, so clients
-- cannot move an object between owners/discussions through UPDATE.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('discussion-images', 'discussion-images', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy avatars_select_visible_profile on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'avatars'
    and private.try_uuid((storage.foldername(name))[1]) is not null
    and private.can_view_profile(private.try_uuid((storage.foldername(name))[1]))
  );
create policy avatars_insert_own_folder on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and private.try_uuid((storage.foldername(name))[1]) = (select auth.uid())
  );
create policy avatars_update_own_folder on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and private.try_uuid((storage.foldername(name))[1]) = (select auth.uid())
  )
  with check (
    bucket_id = 'avatars'
    and private.try_uuid((storage.foldername(name))[1]) = (select auth.uid())
  );
create policy avatars_delete_own_folder on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and private.try_uuid((storage.foldername(name))[1]) = (select auth.uid())
  );

create policy discussion_images_select_visible_discussion on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'discussion-images'
    and private.try_uuid((storage.foldername(name))[1]) is not null
    and private.can_view_discussion(private.try_uuid((storage.foldername(name))[1]))
  );
create policy discussion_images_insert_manager on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'discussion-images'
    and private.try_uuid((storage.foldername(name))[1]) is not null
    and private.can_manage_discussion(private.try_uuid((storage.foldername(name))[1]))
  );
create policy discussion_images_update_manager on storage.objects
  for update to authenticated
  using (
    bucket_id = 'discussion-images'
    and private.try_uuid((storage.foldername(name))[1]) is not null
    and private.can_manage_discussion(private.try_uuid((storage.foldername(name))[1]))
  )
  with check (
    bucket_id = 'discussion-images'
    and private.try_uuid((storage.foldername(name))[1]) is not null
    and private.can_manage_discussion(private.try_uuid((storage.foldername(name))[1]))
  );
create policy discussion_images_delete_manager on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'discussion-images'
    and private.try_uuid((storage.foldername(name))[1]) is not null
    and private.can_manage_discussion(private.try_uuid((storage.foldername(name))[1]))
  );

-- Realtime publication includes only chat state. Realtime subscriptions execute as
-- the subscriber and therefore remain constrained by the chat RLS policies above.
do $$
begin
  if exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_rooms'
    ) then alter publication supabase_realtime add table public.chat_rooms; end if;
    if not exists (
      select 1 from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_room_members'
    ) then alter publication supabase_realtime add table public.chat_room_members; end if;
    if not exists (
      select 1 from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
    ) then alter publication supabase_realtime add table public.chat_messages; end if;
    if not exists (
      select 1 from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_message_reactions'
    ) then alter publication supabase_realtime add table public.chat_message_reactions; end if;
    if not exists (
      select 1 from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_read_states'
    ) then alter publication supabase_realtime add table public.chat_read_states; end if;
  end if;
end
$$;

commit;
