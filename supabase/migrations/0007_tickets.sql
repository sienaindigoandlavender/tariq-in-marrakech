-- Skip-the-line tickets ('tkt') and gift vouchers ('gft'). Safe to run more than once.
alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_check check (category in ('exc','des','act','tkt','trf','svc','kit','gft'));

-- Badge tags (small group, sunrise, family-friendly...). See lib/badges.ts.
alter table products add column if not exists tags text[] not null default '{}';

-- Private tours priced per person (e.g. Sahara: group €189 pp, private €450 pp).
alter table products add column if not exists private_pp numeric(10,2);
