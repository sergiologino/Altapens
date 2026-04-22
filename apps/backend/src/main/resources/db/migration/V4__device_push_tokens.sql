create table device_push_tokens (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    platform varchar(16) not null,
    token varchar(4096) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    constraint ux_device_push_tokens_token unique (token)
);

create index ix_device_push_tokens_user_id on device_push_tokens(user_id);
