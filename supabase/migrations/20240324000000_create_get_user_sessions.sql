-- Create a function to get user sessions
create or replace function public.get_user_sessions(user_id uuid)
returns table (
  id uuid,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  factor_id text,
  aal text,
  not_after timestamptz
)
security definer
set search_path = public
language plpgsql
as $$
begin
  -- Check if the requesting user has permission to view sessions
  if auth.uid() = user_id then
    return query
      select 
        s.id,
        s.user_id,
        s.created_at,
        s.updated_at,
        s.factor_id,
        s.aal,
        s.not_after
      from auth.sessions s
      where s.user_id = user_id
      order by s.created_at desc;
  else
    raise exception 'Not authorized to view sessions for this user';
  end if;
end;
$$; 