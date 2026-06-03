-- Trigger que cria profile/barber/client automaticamente quando usuário é criado no auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_type text;
begin
  user_type := new.raw_user_meta_data->>'type';

  insert into public.profiles (id, type, full_name, phone, cpf)
  values (
    new.id,
    coalesce(user_type, 'client'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'cpf'
  )
  on conflict (id) do nothing;

  if user_type = 'barber' then
    insert into public.barbers (id, bio, instagram_url, status, service_radius_km)
    values (
      new.id,
      new.raw_user_meta_data->>'bio',
      new.raw_user_meta_data->>'instagram',
      'pending',
      coalesce((new.raw_user_meta_data->>'service_radius_km')::integer, 10)
    )
    on conflict (id) do nothing;
  else
    insert into public.clients (id)
    values (new.id)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
