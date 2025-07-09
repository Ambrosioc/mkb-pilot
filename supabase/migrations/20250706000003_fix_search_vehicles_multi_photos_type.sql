-- Migration: Corriger le type de retour de photos dans search_vehicles_multi
-- Date: 2025-07-06

-- Supprimer d'abord la fonction existante
DROP FUNCTION IF EXISTS search_vehicles_multi(text, text, text, text, numeric, numeric, integer, integer, integer);

-- Recréer la fonction avec le bon type pour photos (text[] au lieu de jsonb)
CREATE FUNCTION search_vehicles_multi(
  search_param text default null,
  status_param text default null,
  brand_param text default null,
  location_param text default null,
  min_price_param numeric default null,
  max_price_param numeric default null,
  year_param integer default null,
  page_param integer default 1,
  limit_count_param integer default 10
)
returns table (
  id uuid,
  reference text,
  vehicle_year integer,
  mileage integer,
  color text,
  vehicle_location text,
  price numeric,
  created_at timestamptz,
  updated_at timestamptz,
  vehicle_status text,
  brand_name text,
  model_name text,
  photos text[],
  total_count bigint
) as $$
declare
  total bigint;
begin
  -- Calculer le total pour la pagination
  select count(*)
  into total
  from cars_v2 c
    inner join brands b on c.brand_id = b.id
    inner join models m on c.model_id = m.id
  where (
    search_param is null
    or lower(c.reference) like '%' || lower(search_param) || '%'
    or lower(b.name) like '%' || lower(search_param) || '%'
    or lower(m.name) like '%' || lower(search_param) || '%'
  )
  and (status_param is null or c.status = status_param)
  and (brand_param is null or b.name = brand_param)
  and (location_param is null or c.location = location_param)
  and (min_price_param is null or c.price >= min_price_param)
  and (max_price_param is null or c.price <= max_price_param)
  and (year_param is null or c.year = year_param);

  -- Retourner les données avec le total
  return query
  select
    c.id,
    c.reference,
    c.year as vehicle_year,
    c.mileage,
    c.color,
    c.location as vehicle_location,
    c.price,
    c.created_at,
    c.updated_at,
    c.status as vehicle_status,
    b.name as brand_name,
    m.name as model_name,
    COALESCE(a.photos, ARRAY[]::text[]) as photos,
    total as total_count
  from cars_v2 c
    inner join brands b on c.brand_id = b.id
    inner join models m on c.model_id = m.id
    left join advertisements a on a.car_id = c.id
  where (
    search_param is null
    or lower(c.reference) like '%' || lower(search_param) || '%'
    or lower(b.name) like '%' || lower(search_param) || '%'
    or lower(m.name) like '%' || lower(search_param) || '%'
  )
  and (status_param is null or c.status = status_param)
  and (brand_param is null or b.name = brand_param)
  and (location_param is null or c.location = location_param)
  and (min_price_param is null or c.price >= min_price_param)
  and (max_price_param is null or c.price <= max_price_param)
  and (year_param is null or c.year = year_param)
  order by c.created_at desc
  offset ((page_param - 1) * limit_count_param)
  limit limit_count_param;
end;
$$ language plpgsql stable;

-- Donner les permissions nécessaires
grant execute on function search_vehicles_multi to authenticated;
grant execute on function search_vehicles_multi to anon;

-- Commentaire pour documenter la correction
comment on function search_vehicles_multi is 'Recherche multi-champs dans les véhicules avec filtres et pagination. Recherche dans référence, marque et modèle. Type photos corrigé en text[].'; 