create table notification_send_log (
    id uuid primary key,
    dedupe_key varchar(512) not null,
    created_at timestamp with time zone not null,
    constraint ux_notification_send_log_dedupe unique (dedupe_key)
);
