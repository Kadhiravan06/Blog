-- The Margin: initial schema.
-- Run this once in the Supabase SQL editor (or `supabase db push`).

create extension if not exists citext;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username citext not null unique,
  display_name text not null,
  bio text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  constraint profiles_bio_len check (char_length(bio) <= 280),
  constraint profiles_username_format check (username::text ~ '^[a-z0-9_]{3,24}$')
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  slug citext not null unique,
  title text not null,
  excerpt text not null default '',
  content_md text not null,
  cover_url text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_title_len check (char_length(title) between 3 and 120),
  constraint posts_slug_len check (char_length(slug::text) between 1 and 80),
  constraint posts_slug_format check (slug::text ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint posts_excerpt_len check (char_length(excerpt) <= 240),
  constraint posts_content_len check (char_length(content_md) <= 50000),
  constraint posts_tags_len check (cardinality(tags) <= 5),
  constraint posts_published_at check ((status = 'published') = (published_at is not null))
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comments_body_len check (char_length(body) between 1 and 2000)
);

create index if not exists posts_feed_idx on public.posts (status, published_at desc, id desc);
create index if not exists posts_author_idx on public.posts (author_id);
create index if not exists comments_post_idx on public.comments (post_id, created_at, id);
create index if not exists comments_author_idx on public.comments (author_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row
  execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'user' || substr(replace(new.id::text, '-', ''), 1, 12),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Deny-all backstop: only the service role (route handlers) touches these tables.
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Public read bucket; writes only through the service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('covers', 'covers', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
