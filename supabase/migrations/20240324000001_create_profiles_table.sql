-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  email text not null,
  name text,
  avatar_url text,
  role text not null default 'USER',
  organization text,
  department text,
  phone text,
  constraint email_matches_auth check (email = auth.jwt() ->> 'email')
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create a trigger to set updated_at on update
create trigger set_profiles_updated_at
  before update on profiles
  for each row
  execute function public.set_updated_at();

-- Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'USER'));

  return new;
end;
$$;

-- Create a trigger to automatically create profile records
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user(); 