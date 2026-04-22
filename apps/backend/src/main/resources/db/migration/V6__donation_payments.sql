create table donation_payments (
    id uuid primary key,
    yookassa_payment_id varchar(64),
    amount_kopecks bigint not null,
    status varchar(32) not null,
    user_id uuid references users(id) on delete set null,
    demo_mode boolean not null default false,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index ix_donation_payments_yookassa on donation_payments(yookassa_payment_id);
create index ix_donation_payments_user on donation_payments(user_id);
