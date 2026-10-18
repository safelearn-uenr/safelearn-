-- SafeLearn hardening: prevent the same Mobile Money transaction from being reused.
-- Review and resolve any existing duplicates before running this migration.
do $$
begin
  if exists (
    select 1
    from public.payment_requests
    group by lower(btrim(transaction_id))
    having count(*) > 1
  ) then
    raise exception 'Duplicate payment transaction IDs exist; resolve them before applying 003_safelearn_hardening.sql';
  end if;
end $$;

create unique index if not exists payment_requests_transaction_id_unique
  on public.payment_requests (lower(btrim(transaction_id)));
