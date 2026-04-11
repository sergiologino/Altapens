create table wellbeing_checkins (
    id uuid primary key,
    senior_profile_id uuid not null references senior_profiles(id) on delete cascade,
    state varchar(32) not null,
    note varchar(500),
    created_at timestamp with time zone not null
);

create index ix_wellbeing_checkins_senior_created on wellbeing_checkins(senior_profile_id, created_at desc);

create table medication_intakes (
    id uuid primary key,
    medication_id uuid not null references medications(id) on delete cascade,
    occurrence_date date not null,
    slot_index integer not null,
    status varchar(32) not null,
    recorded_by_user_id uuid not null references users(id),
    recorded_at timestamp with time zone not null,
    constraint ux_medication_intake_slot unique (medication_id, occurrence_date, slot_index)
);

create index ix_medication_intakes_med_date on medication_intakes(medication_id, occurrence_date desc);
