create table medications (
    id uuid primary key,
    senior_profile_id uuid not null references senior_profiles(id) on delete cascade,
    title varchar(255) not null,
    dosage_text varchar(255) not null,
    instructions text not null,
    exact_times varchar(500) not null,
    days_of_week varchar(120) not null,
    confirmation_required boolean not null,
    notify_on_missed boolean not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index ix_medications_senior_profile on medications(senior_profile_id);
