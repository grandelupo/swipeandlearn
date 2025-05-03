alter table stories 
  add column last_viewed_page integer default 1;

-- Update existing stories to have last_viewed_page = 1
update stories 
set last_viewed_page = 1 
where last_viewed_page is null;