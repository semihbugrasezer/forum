-- Enable realtime for required tables
alter publication supabase_realtime add table public.topics;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.likes;

-- Enable row level security for realtime
alter table public.topics replica identity full;
alter table public.comments replica identity full;
alter table public.likes replica identity full;

-- Create function to handle realtime updates
create or replace function handle_realtime_updates()
returns trigger as $$
begin
  if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
    perform pg_notify(
      'realtime',
      json_build_object(
        'table', TG_TABLE_NAME,
        'type', TG_OP,
        'record', row_to_json(NEW)
      )::text
    );
  elsif (TG_OP = 'DELETE') then
    perform pg_notify(
      'realtime',
      json_build_object(
        'table', TG_TABLE_NAME,
        'type', TG_OP,
        'old_record', row_to_json(OLD)
      )::text
    );
  end if;
  return null;
end;
$$ language plpgsql; 