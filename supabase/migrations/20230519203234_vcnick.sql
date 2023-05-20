create table "public"."nicknames" (
    "id" uuid not null default uuid_generate_v4(),
    "voice_channel_id" text not null,
    "user_id" text not null,
    "guild_id" text not null,
    "old_nickname" text not null,
    "new_nickname" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."nicknames" enable row level security;

CREATE UNIQUE INDEX nicknames_pkey ON public.nicknames USING btree (voice_channel_id, user_id, guild_id);

alter table "public"."nicknames" add constraint "nicknames_pkey" PRIMARY KEY using index "nicknames_pkey";


