create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  currency text default 'USD',
  created_at timestamptz default now()
);

create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text check (type in ('expense', 'income')) not null,
  icon text,
  color text,
  created_at timestamptz default now()
);

create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount decimal(12,2) not null,
  currency text default 'USD',
  category_id uuid references public.categories on delete set null,
  description text,
  date date default current_date,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;