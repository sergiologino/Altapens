create table users (
    id uuid primary key,
    email varchar(255) not null unique,
    phone varchar(64) not null,
    password_hash varchar(255) not null,
    status varchar(32) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table user_roles (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    role_name varchar(32) not null
);

create unique index ux_user_roles_user_role on user_roles(user_id, role_name);

create table senior_profiles (
    id uuid primary key,
    user_id uuid not null unique references users(id) on delete cascade,
    first_name varchar(120) not null,
    last_name varchar(120) not null,
    timezone varchar(80) not null,
    preferred_language varchar(32) not null,
    font_scale_preference varchar(32) not null,
    voice_enabled boolean not null,
    onboarding_completed boolean not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table caregiver_profiles (
    id uuid primary key,
    user_id uuid not null unique references users(id) on delete cascade,
    display_name varchar(160) not null,
    relationship_default_type varchar(64) not null,
    phone varchar(64) not null,
    email varchar(255) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table care_invites (
    id uuid primary key,
    code varchar(64) not null unique,
    created_by_user_id uuid not null references users(id),
    target_role varchar(32) not null,
    status varchar(32) not null,
    expires_at timestamp with time zone not null,
    accepted_by_user_id uuid references users(id),
    note varchar(500),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table care_relationships (
    id uuid primary key,
    senior_id uuid not null references senior_profiles(id),
    caregiver_id uuid not null references caregiver_profiles(id),
    status varchar(32) not null,
    invited_at timestamp with time zone not null,
    accepted_at timestamp with time zone not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create unique index ux_care_relationship_pair on care_relationships(senior_id, caregiver_id);
