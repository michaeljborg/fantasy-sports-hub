-- Saved Yahoo reads, one row per user + kind + key (e.g. roster / 466.l.12345.t.3).
-- `data` is the app-shaped JSON (see src/lib/yahoo/team.ts); `fetched_at` decides
-- when it's due for a refresh (see src/lib/yahoo/snapshots.ts).
create table if not exists yahoo_snapshots (
  user_guid  text        not null,
  kind       text        not null,
  key        text        not null,
  data       jsonb       not null,
  fetched_at timestamptz not null default now(),
  primary key (user_guid, kind, key)
);
