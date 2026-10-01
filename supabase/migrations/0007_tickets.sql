-- Monument tickets category ('tkt'). Safe to run more than once.
alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_check check (category in ('exc','des','act','tkt','trf','svc','kit'));
