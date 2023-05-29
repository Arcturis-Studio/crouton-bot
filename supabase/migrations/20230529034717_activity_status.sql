create table "public"."presence" (
    "id" uuid not null default gen_random_uuid(),
    "type" text not null,
    "activity" text not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."presence" enable row level security;

CREATE UNIQUE INDEX presence_pkey ON public.presence USING btree (id);

alter table "public"."presence" add constraint "presence_pkey" PRIMARY KEY using index "presence_pkey";


