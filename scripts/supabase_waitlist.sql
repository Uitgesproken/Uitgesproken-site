create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table waitlist enable row level security;

create policy "Allow public insert"
on waitlist
for insert
to anon
with check (true);
