-- ============================================
-- NoteCrate: Initial Schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================

-- ---- Profiles (extends Supabase auth.users) ----

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text unique not null,
  image text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, image)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---- Folders ----

create table public.folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  parent_id uuid references public.folders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index folders_user_id_idx on public.folders(user_id);
create index folders_parent_id_idx on public.folders(parent_id);

alter table public.folders enable row level security;

create policy "Users can read own folders"
  on public.folders for select
  using (auth.uid() = user_id);

create policy "Users can insert own folders"
  on public.folders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own folders"
  on public.folders for update
  using (auth.uid() = user_id);

create policy "Users can delete own folders"
  on public.folders for delete
  using (auth.uid() = user_id);


-- ---- Highlights ----

create table public.highlights (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  source_title text not null,
  source_url text not null,
  color text default 'yellow' not null,
  type text default 'text' not null,
  image_url text,
  video_id text,
  video_timestamp text,
  folder_id uuid references public.folders(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

create index highlights_folder_id_idx on public.highlights(folder_id);
create index highlights_user_id_idx on public.highlights(user_id);
create index highlights_created_at_idx on public.highlights(created_at desc);

alter table public.highlights enable row level security;

create policy "Users can read own highlights"
  on public.highlights for select
  using (auth.uid() = user_id);

create policy "Users can insert own highlights"
  on public.highlights for insert
  with check (auth.uid() = user_id);

create policy "Users can update own highlights"
  on public.highlights for update
  using (auth.uid() = user_id);

create policy "Users can delete own highlights"
  on public.highlights for delete
  using (auth.uid() = user_id);


-- ---- Chat Messages ----

create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  role text not null,
  content text not null,
  folder_id uuid references public.folders(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  artifact_title text,
  artifact_content text,
  artifact_type text
);

create index chat_messages_folder_id_idx on public.chat_messages(folder_id);
create index chat_messages_user_id_idx on public.chat_messages(user_id);
create index chat_messages_created_at_idx on public.chat_messages(created_at);

alter table public.chat_messages enable row level security;

create policy "Users can read own chat messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chat messages"
  on public.chat_messages for update
  using (auth.uid() = user_id);

create policy "Users can delete own chat messages"
  on public.chat_messages for delete
  using (auth.uid() = user_id);


-- ---- Helper: Auto-update updated_at ----

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger folders_updated_at
  before update on public.folders
  for each row execute function public.update_updated_at();
