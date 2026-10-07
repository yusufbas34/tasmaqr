-- Tasma QR veritabanı kurulumu (tek dosya): künyeler, okutma ve konum bildirimleri, talep formu, basılı künye siparişi.
-- Supabase > SQL Editor'da çalıştırın. Tekrar çalıştırmak güvenlidir; mevcut verilere dokunmaz.
-- Tüm tablo ve fonksiyonlar "tasma_" ile başlar: Araç QR ile aynı Supabase projesinde çakışmadan çalışır.
--
-- ADMIN ŞİFRESİ: aşağıdaki v_sifre satırına kendi şifrenizi yazın (en az 10 karakter) ve çalıştırın.
-- Şifreyi değiştirmek için yalnızca o satırı değiştirip dosyayı yeniden çalıştırın. 'BURAYA-SIFRE' kalırsa şifre değişmez.

-- Bildirimler (Telegram / e-posta) Supabase'in pg_net eklentisiyle gönderilir. Eklenti açılamazsa sistem yine çalışır,
-- yalnızca bildirim gitmez.
do $$ begin
  create extension if not exists pg_net;
exception when others then raise notice 'pg_net açılamadı, bildirimler kapalı: %', sqlerrm;
end $$;

-- ---------------------------------------------------------------- admin şifresi
create table if not exists public.tasma_config (
  id integer primary key default 1 check (id = 1),
  admin_salt text not null,
  admin_hash text not null
);
alter table public.tasma_config enable row level security;  -- politika yok: doğrudan erişim kapalı
revoke all on public.tasma_config from anon, authenticated;

do $$
declare
  v_sifre text := 'BURAYA-SIFRE';  -- <<< admin şifrenizi buraya yazın
  v_salt text := replace(gen_random_uuid()::text, '-', '');
begin
  if v_sifre = 'BURAYA-SIFRE' then
    if not exists (select 1 from public.tasma_config) then
      raise exception 'Admin şifresi ayarlanmadı: dosyanın başındaki v_sifre satırına şifrenizi yazıp tekrar çalıştırın.';
    end if;
    return;
  end if;
  if length(v_sifre) < 10 then raise exception 'Admin şifresi en az 10 karakter olmalı.'; end if;
  insert into public.tasma_config (id, admin_salt, admin_hash)
    values (1, v_salt, encode(sha256(convert_to(v_salt || v_sifre, 'UTF8')), 'hex'))
    on conflict (id) do update set admin_salt = excluded.admin_salt, admin_hash = excluded.admin_hash;
end $$;

-- Şifre hatalıysa hata verir (HTTP 403); yönetim fonksiyonları bunu çağırır.
create or replace function public.tasma_admin_check(p_key text)
returns void
language plpgsql security definer set search_path = public
as $$
declare c tasma_config;
begin
  select * into c from tasma_config where id = 1;
  if not found or encode(sha256(convert_to(c.admin_salt || coalesce(p_key, ''), 'UTF8')), 'hex') <> c.admin_hash then
    perform pg_sleep(.5);  -- deneme-yanılmayı yavaşlatır
    raise exception 'Yetkisiz' using errcode = '28000';
  end if;
end $$;
revoke all on function public.tasma_admin_check(text) from public, anon, authenticated;  -- yalnızca içeriden

create or replace function public.tasma_version() returns integer language sql immutable as 'select 1';

-- ---------------------------------------------------------------- künyeler
-- source = 'admin': yönetimden üretilip basılan (PIN kartıyla verilir, sahibi QR'ı okutup numarasını bağlar)
-- source = 'self' : sitede / uygulamada sahibinin kendi oluşturduğu
create table if not exists public.tasma_tags (
  code text primary key,
  pin text not null,
  source text not null default 'self' check (source in ('admin', 'self')),
  phone text,
  pet_name text,
  notes text,                 -- sağlık, karakter vb. (bulan kişiye gösterilir)
  reward text,                -- kayıpken gösterilen ödül notu
  lost boolean not null default false,
  lost_since timestamptz,
  backup_phone text,
  backup_name text,
  device text,
  given_at timestamptz,       -- yönetim: künye birine verildi
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  fail_count integer not null default 0,
  locked_until timestamptz
);
create index if not exists tasma_tags_created_idx on public.tasma_tags (created_at);
alter table public.tasma_tags enable row level security;
revoke all on public.tasma_tags from anon, authenticated;

-- okutma sayacı: yalnızca kod ve zaman (IP, cihaz vb. tutulmaz)
create table if not exists public.tasma_scans (
  id bigint generated always as identity primary key,
  code text not null,
  scanned_at timestamptz not null default now()
);
create index if not exists tasma_scans_code_idx on public.tasma_scans (code, scanned_at);
alter table public.tasma_scans enable row level security;
revoke all on public.tasma_scans from anon, authenticated;

-- bulan kişinin kendi isteğiyle gönderdiği konumlar (yalnızca PIN'i bilen sahibi görür)
create table if not exists public.tasma_sightings (
  id bigint generated always as identity primary key,
  code text not null,
  lat double precision not null,
  lng double precision not null,
  accuracy integer,
  seen_at timestamptz not null default now()
);
create index if not exists tasma_sightings_code_idx on public.tasma_sightings (code, seen_at);
alter table public.tasma_sightings enable row level security;
revoke all on public.tasma_sightings from anon, authenticated;

-- Yeni künye: kriptografik rastgele kod (K… yönetim, S… kendi oluşturulan) ve 6 haneli PIN
create or replace function public.tasma_new_tag(p_source text)
returns public.tasma_tags
language plpgsql security definer set search_path = public
as $$
declare
  v_hex text;
  v_code text;
  t tasma_tags;
begin
  loop
    v_hex := upper(replace(gen_random_uuid()::text, '-', ''));
    v_code := case when p_source = 'admin' then 'K' else 'S' end || translate(substr(v_hex, 1, 7), '01', 'XY');  -- 0/1, O/I ile karışmasın
    exit when not exists (select 1 from tasma_tags where code = v_code);
  end loop;
  insert into tasma_tags (code, pin, source)
    values (v_code, lpad(((('x' || substr(v_hex, 17, 8))::bit(32)::bigint) % 1000000)::text, 6, '0'), p_source)
    returning * into t;
  return t;
end $$;
revoke all on function public.tasma_new_tag(text) from public, anon, authenticated;  -- yalnızca içeriden

-- Sahibi kendi künyesini oluşturur: {ok:true, code, pin} ya da {ok:false, error}
create or replace function public.tasma_tag_create(p_pet_name text, p_phone text, p_device text default null)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_name text := left(trim(coalesce(p_pet_name, '')), 20);
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_device text := nullif(left(trim(coalesce(p_device, '')), 64), '');
  t tasma_tags;
begin
  if v_name = '' then return json_build_object('ok', false, 'error', 'missing'); end if;
  if v_phone !~ '^\+[0-9]{10,15}$' then return json_build_object('ok', false, 'error', 'bad_phone'); end if;
  -- kötüye kullanım sınırları: cihaz başına günde 10, numara başına günde 5, genelde dakikada 30
  if v_device is not null and (select count(*) from tasma_tags where device = v_device and created_at > now() - interval '1 day') >= 10
    then return json_build_object('ok', false, 'error', 'too_many'); end if;
  if (select count(*) from tasma_tags where phone = v_phone and source = 'self' and created_at > now() - interval '1 day') >= 5
    then return json_build_object('ok', false, 'error', 'too_many'); end if;
  if (select count(*) from tasma_tags where created_at > now() - interval '1 minute') >= 30
    then return json_build_object('ok', false, 'error', 'busy'); end if;
  t := public.tasma_new_tag('self');
  update tasma_tags set phone = v_phone, pet_name = v_name, device = v_device where code = t.code;
  return json_build_object('ok', true, 'code', t.code, 'pin', t.pin);
end $$;

-- QR okutulunca: bulan kişiye gösterilecek bilgiler. Okutmayı sayar (aynı koda 30 saniye içindeki tekrarlar sayılmaz).
create or replace function public.tasma_tag_lookup(p_code text)
returns json
language plpgsql volatile security definer set search_path = public
as $$
declare t tasma_tags;
begin
  select * into t from tasma_tags where code = upper(trim(coalesce(p_code, '')));
  if not found then return json_build_object('exists', false); end if;
  if t.phone is not null and not exists (select 1 from tasma_scans where code = t.code and scanned_at > now() - interval '30 seconds') then
    insert into tasma_scans (code) values (t.code);
  end if;
  return json_build_object('exists', true, 'phone', t.phone, 'pet_name', t.pet_name, 'notes', t.notes, 'reward', t.reward,
    'lost', t.lost, 'lost_since', t.lost_since, 'backup_phone', t.backup_phone, 'backup_name', t.backup_name);
end $$;

-- PIN kontrolü: doğruysa null, değilse hata kodu. 5 yanlış denemede 15 dakika kilit.
create or replace function public.tasma_check_pin(p_code text, p_pin text)
returns text
language plpgsql security definer set search_path = public
as $$
declare t tasma_tags;
begin
  select * into t from tasma_tags where code = upper(trim(coalesce(p_code, ''))) for update;
  if not found then return 'not_found'; end if;
  if t.locked_until > now() then return 'locked'; end if;
  if t.pin <> trim(coalesce(p_pin, '')) then
    update tasma_tags set
      fail_count = case when t.fail_count + 1 >= 5 then 0 else t.fail_count + 1 end,
      locked_until = case when t.fail_count + 1 >= 5 then now() + interval '15 minutes' else null end
      where code = t.code;
    return 'bad_pin';
  end if;
  update tasma_tags set fail_count = 0, locked_until = null where code = t.code and fail_count <> 0;
  return null;
end $$;
revoke all on function public.tasma_check_pin(text, text) from public, anon, authenticated;  -- yalnızca içeriden

create or replace function public.tasma_pin_error(p_code text, p_err text)
returns json
language sql stable security definer set search_path = public
as $$
  select case when p_err = 'locked' then json_build_object('ok', false, 'error', 'locked',
      'minutes', (select ceil(extract(epoch from locked_until - now()) / 60) from tasma_tags where code = upper(trim(p_code))))
    else json_build_object('ok', false, 'error', p_err) end;
$$;
revoke all on function public.tasma_pin_error(text, text) from public, anon, authenticated;  -- yalnızca içeriden

-- Künye bilgilerini kaydeder (PIN ile). p_claim: boş künyeyi ilk kez bağlarken true; biri az önce bağladıysa 'already' döner.
create or replace function public.tasma_tag_save(p_code text, p_pin text, p_phone text, p_pet_name text, p_notes text,
  p_lost boolean, p_reward text, p_backup_phone text, p_backup_name text, p_claim boolean default false)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_name text := left(trim(coalesce(p_pet_name, '')), 20);
  v_backup text := nullif(regexp_replace(coalesce(p_backup_phone, ''), '[^0-9+]', '', 'g'), '');
  v_err text;
  t tasma_tags;
begin
  v_err := public.tasma_check_pin(v_code, p_pin);
  if v_err is not null then return public.tasma_pin_error(v_code, v_err); end if;
  select * into t from tasma_tags where code = v_code;
  if p_claim and t.phone is not null then return json_build_object('ok', false, 'error', 'already'); end if;
  if v_name = '' then return json_build_object('ok', false, 'error', 'missing'); end if;
  if v_phone !~ '^\+[0-9]{10,15}$' then return json_build_object('ok', false, 'error', 'bad_phone'); end if;
  if v_backup is not null and v_backup !~ '^\+[0-9]{10,15}$' then return json_build_object('ok', false, 'error', 'bad_backup'); end if;
  update tasma_tags set
    phone = v_phone, pet_name = v_name,
    notes = nullif(left(trim(coalesce(p_notes, '')), 300), ''),
    reward = nullif(left(trim(coalesce(p_reward, '')), 60), ''),
    lost = coalesce(p_lost, false),
    lost_since = case when not coalesce(p_lost, false) then null when t.lost then t.lost_since else now() end,
    backup_phone = v_backup,
    backup_name = case when v_backup is null then null else nullif(left(trim(coalesce(p_backup_name, '')), 40), '') end,
    updated_at = now()
  where code = v_code;
  return json_build_object('ok', true, 'phone', v_phone);
end $$;

-- Kayıp modunu hızlıca açar / kapatır (PIN ile)
create or replace function public.tasma_tag_set_lost(p_code text, p_pin text, p_lost boolean)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_err text := public.tasma_check_pin(v_code, p_pin);
begin
  if v_err is not null then return public.tasma_pin_error(v_code, v_err); end if;
  update tasma_tags set lost = coalesce(p_lost, false),
    lost_since = case when not coalesce(p_lost, false) then null when lost then lost_since else now() end, updated_at = now()
  where code = v_code;
  return json_build_object('ok', true, 'lost', coalesce(p_lost, false));
end $$;

-- Bulan kişi konumunu paylaşır. Kötüye kullanım sınırları: künye başına saatte 10, genelde dakikada 60.
create or replace function public.tasma_report_location(p_code text, p_lat double precision, p_lng double precision, p_accuracy integer default null)
returns json
language plpgsql security definer set search_path = public
as $$
declare v_code text := upper(trim(coalesce(p_code, '')));
begin
  if not exists (select 1 from tasma_tags where code = v_code and phone is not null) then
    return json_build_object('ok', false, 'error', 'not_found');
  end if;
  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    return json_build_object('ok', false, 'error', 'bad_location');
  end if;
  if (select count(*) from tasma_sightings where code = v_code and seen_at > now() - interval '1 hour') >= 10
    or (select count(*) from tasma_sightings where seen_at > now() - interval '1 minute') >= 60 then
    return json_build_object('ok', false, 'error', 'too_many');
  end if;
  insert into tasma_sightings (code, lat, lng, accuracy)
    values (v_code, round(p_lat::numeric, 6), round(p_lng::numeric, 6), least(greatest(p_accuracy, 0), 100000));
  return json_build_object('ok', true);
end $$;

-- Sahibine istatistik ve son konumlar (yalnızca PIN'i bilen): [{code, pet_name, lost, total, last30, last, sightings:[…]}]
create or replace function public.tasma_tag_stats(p_codes text[], p_pins text[])
returns json
language sql stable security definer set search_path = public
as $$
  select coalesce(json_agg(json_build_object('code', t.code, 'pet_name', t.pet_name, 'lost', t.lost, 'phone', t.phone,
      'total', (select count(*) from tasma_scans s where s.code = t.code),
      'last30', (select count(*) from tasma_scans s where s.code = t.code and s.scanned_at > now() - interval '30 days'),
      'last', (select max(scanned_at) from tasma_scans s where s.code = t.code),
      'sightings', (select coalesce(json_agg(json_build_object('lat', g.lat, 'lng', g.lng, 'accuracy', g.accuracy, 'at', g.seen_at)
          order by g.seen_at desc), '[]'::json)
        from (select * from tasma_sightings g where g.code = t.code and g.seen_at > now() - interval '30 days'
              order by g.seen_at desc limit 5) g))), '[]'::json)
  from unnest(p_codes, p_pins) as q(code, pin)
  join tasma_tags t on t.code = upper(trim(q.code)) and t.pin = trim(q.pin);
$$;

-- ---------------------------------------------------------------- yönetim: basılan künyeler
create or replace function public.tasma_admin_list(p_key text)
returns table (code text, pin text, phone text, pet_name text, given_at timestamptz, created_at timestamptz)
language plpgsql security definer set search_path = public
as $$
begin
  perform public.tasma_admin_check(p_key);
  return query select t.code, t.pin, t.phone, t.pet_name, t.given_at, t.created_at
    from tasma_tags t where t.source = 'admin' order by t.created_at, t.code;
end $$;

create or replace function public.tasma_admin_add(p_key text, p_count integer)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer := least(greatest(coalesce(p_count, 0), 0), 100);
begin
  perform public.tasma_admin_check(p_key);
  for i in 1 .. n loop perform public.tasma_new_tag('admin'); end loop;
  return n;
end $$;

-- Künyeleri verildi / verilmedi olarak işaretler
create or replace function public.tasma_admin_set_given(p_key text, p_codes text[], p_given boolean)
returns integer
language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  perform public.tasma_admin_check(p_key);
  update tasma_tags set given_at = case when p_given then now() else null end
    where code = any (select upper(trim(c)) from unnest(p_codes) c) and source = 'admin';
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------------------------------------------------------------- talep formu
create table if not exists public.tasma_requests (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,           -- isteğe bağlı: künye WhatsApp'tan istenirse
  pet_name text,
  note text,
  status text not null default 'yeni' check (status in ('yeni', 'verildi', 'iptal')),
  tag_code text,
  updated_at timestamptz
);
alter table public.tasma_requests enable row level security;
revoke all on public.tasma_requests from anon, authenticated;

create or replace function public.tasma_request_create(p_first_name text, p_last_name text, p_email text,
  p_phone text default null, p_pet_name text default null, p_note text default null)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_first text := left(trim(coalesce(p_first_name, '')), 60);
  v_last  text := left(trim(coalesce(p_last_name, '')), 60);
  v_email text := lower(left(trim(coalesce(p_email, '')), 120));
  v_phone text := nullif(left(regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g'), 16), '');
  v_pet   text := nullif(left(trim(coalesce(p_pet_name, '')), 20), '');
  v_note  text := nullif(left(trim(coalesce(p_note, '')), 500), '');
begin
  if v_first = '' or v_last = '' then return json_build_object('ok', false, 'error', 'missing'); end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then return json_build_object('ok', false, 'error', 'bad_email'); end if;
  if v_phone is not null and v_phone !~ '^\+?[0-9]{10,15}$' then return json_build_object('ok', false, 'error', 'bad_phone'); end if;
  -- kötüye kullanım sınırları: aynı kişiden günde 3, genelde dakikada 20 talep
  if (select count(*) from tasma_requests where (email = v_email or phone = v_phone) and created_at > now() - interval '1 day') >= 3
    then return json_build_object('ok', false, 'error', 'too_many'); end if;
  if (select count(*) from tasma_requests where created_at > now() - interval '1 minute') >= 20
    then return json_build_object('ok', false, 'error', 'busy'); end if;
  insert into tasma_requests (first_name, last_name, email, phone, pet_name, note)
    values (v_first, v_last, v_email, v_phone, v_pet, v_note);
  return json_build_object('ok', true);
end $$;

create or replace function public.tasma_admin_requests(p_key text)
returns setof public.tasma_requests
language plpgsql security definer set search_path = public
as $$
begin
  perform public.tasma_admin_check(p_key);
  return query select * from tasma_requests order by created_at desc;
end $$;

create or replace function public.tasma_admin_request_update(p_key text, p_id bigint, p_status text, p_tag_code text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.tasma_admin_check(p_key);
  update tasma_requests
     set status = p_status, tag_code = nullif(upper(trim(coalesce(p_tag_code, ''))), ''), updated_at = now()
   where id = p_id;
end $$;

-- ---------------------------------------------------------------- basılı künye siparişi: IBAN ile ödeme bildirimi
create table if not exists public.tasma_shop_settings (
  id integer primary key default 1 check (id = 1),
  active boolean not null default false,          -- IBAN girilip açılana kadar sipariş alınmaz
  price integer not null default 150,             -- TL
  iban text,
  account_name text,
  bank_name text,
  printer_email text,                             -- baskıcı: yalnızca panelde görünür
  shipping_text text not null default 'Kargo ücreti fiyata dahildir.',
  product_text text not null default 'Su geçirmez vinil sticker sayfası: aynı QR 7 farklı ölçüde 29 künye. Künyeye, tasmaya, kafese yapıştırabilirsiniz.',
  telegram_bot_token text,
  telegram_chat_id text,
  resend_api_key text,
  notify_email text,
  updated_at timestamptz
);
insert into public.tasma_shop_settings (id) values (1) on conflict (id) do nothing;
alter table public.tasma_shop_settings enable row level security;
revoke all on public.tasma_shop_settings from anon, authenticated;

create table if not exists public.tasma_orders (
  id bigint generated always as identity primary key,
  code text not null unique,                      -- müşterinin gördüğü sipariş no, havale açıklaması (TQ-XXXXXX)
  token uuid not null default gen_random_uuid(),  -- müşterinin kendi siparişini sorgulaması için gizli anahtar
  created_at timestamptz not null default now(),
  tag_code text not null,
  design text not null,
  full_name text not null,
  phone text not null,
  email text,
  city text not null,
  district text not null,
  address text not null,
  note text,
  amount integer not null,
  status text not null default 'odeme_bekleniyor'
    check (status in ('odeme_bekleniyor', 'odeme_bildirildi', 'onaylandi', 'baskida', 'kargolandi', 'iptal')),
  paid_at timestamptz,
  tracking text,
  admin_note text,
  device text,
  updated_at timestamptz
);
create index if not exists tasma_orders_created_idx on public.tasma_orders (created_at);
alter table public.tasma_orders enable row level security;
revoke all on public.tasma_orders from anon, authenticated;

-- Telegram ve/veya e-posta (Resend) gönderir. Hata olursa işlemi bozmaz, yalnızca uyarı yazar.
create or replace function public.tasma_notify(p_subject text, p_text text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  s tasma_shop_settings;
  sent boolean := false;
begin
  select * into s from tasma_shop_settings where id = 1;
  if to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') is null then return false; end if;
  if coalesce(s.telegram_bot_token, '') <> '' and coalesce(s.telegram_chat_id, '') <> '' then
    execute 'select net.http_post(url := $1, body := $2, headers := $3)'
      using 'https://api.telegram.org/bot' || s.telegram_bot_token || '/sendMessage',
            jsonb_build_object('chat_id', s.telegram_chat_id, 'text', p_subject || E'\n\n' || p_text),
            '{"Content-Type": "application/json"}'::jsonb;
    sent := true;
  end if;
  if coalesce(s.resend_api_key, '') <> '' and coalesce(s.notify_email, '') <> '' then
    execute 'select net.http_post(url := $1, body := $2, headers := $3)'
      using 'https://api.resend.com/emails',
            jsonb_build_object('from', 'Tasma QR <onboarding@resend.dev>', 'to', jsonb_build_array(s.notify_email),
              'subject', p_subject, 'text', p_text),
            jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || s.resend_api_key);
    sent := true;
  end if;
  return sent;
exception when others then
  raise warning 'Tasma QR bildirimi gönderilemedi: %', sqlerrm;
  return false;
end $$;
revoke all on function public.tasma_notify(text, text) from public, anon, authenticated;  -- yalnızca içeriden

-- Müşteri "ödemeyi yaptım" deyince size haber verir
create or replace function public.tasma_orders_notify_paid()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  perform public.tasma_notify('Tasma QR: ödeme bildirimi ' || new.code,
    new.code || ' · ' || new.amount || ' TL' || E'\n' ||
    new.full_name || ' · ' || new.phone || E'\n' ||
    new.district || ' / ' || new.city || E'\n\n' ||
    'Hesabınızı kontrol edip panelden onaylayın: https://yusufbas34.github.io/tasmaqr/?admin');
  return new;
end $$;

drop trigger if exists tasma_orders_paid_notify on public.tasma_orders;
create trigger tasma_orders_paid_notify after update of status on public.tasma_orders
  for each row when (new.status = 'odeme_bildirildi' and old.status is distinct from new.status)
  execute function public.tasma_orders_notify_paid();

-- Herkese açık satış bilgileri (baskıcı e-postası ve bildirim anahtarları hariç)
create or replace function public.tasma_shop_info()
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object('active', active and coalesce(iban, '') <> '' and coalesce(account_name, '') <> '',
    'price', price, 'iban', iban, 'account_name', account_name, 'bank_name', bank_name,
    'shipping_text', shipping_text, 'product_text', product_text)
  from tasma_shop_settings where id = 1;
$$;

create or replace function public.tasma_order_create(
  p_tag_code text, p_design text, p_full_name text, p_phone text, p_email text,
  p_city text, p_district text, p_address text, p_note text default null, p_device text default null)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  s tasma_shop_settings;
  v_tag text := upper(trim(coalesce(p_tag_code, '')));
  v_design text := left(lower(trim(coalesce(p_design, ''))), 20);
  v_name text := left(trim(coalesce(p_full_name, '')), 80);
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  v_email text := nullif(lower(left(trim(coalesce(p_email, '')), 120)), '');
  v_city text := left(trim(coalesce(p_city, '')), 40);
  v_district text := left(trim(coalesce(p_district, '')), 60);
  v_address text := left(trim(coalesce(p_address, '')), 400);
  v_note text := nullif(left(trim(coalesce(p_note, '')), 300), '');
  v_device text := nullif(left(trim(coalesce(p_device, '')), 64), '');
  v_code text;
  o tasma_orders;
begin
  select * into s from tasma_shop_settings where id = 1;
  if not (s.active and coalesce(s.iban, '') <> '' and coalesce(s.account_name, '') <> '') then
    return json_build_object('ok', false, 'error', 'closed');
  end if;
  if not exists (select 1 from tasma_tags where code = v_tag and phone is not null) then
    return json_build_object('ok', false, 'error', 'no_tag');
  end if;
  if v_design !~ '^[a-z]{2,20}$' then v_design := 'klasik'; end if;
  if length(v_name) < 3 or v_city = '' or v_district = '' or length(v_address) < 10 then
    return json_build_object('ok', false, 'error', 'missing');
  end if;
  if v_phone !~ '^\+[0-9]{10,15}$' then return json_build_object('ok', false, 'error', 'bad_phone'); end if;
  if v_email is not null and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then return json_build_object('ok', false, 'error', 'bad_email'); end if;
  -- kötüye kullanım sınırları: cihaz / telefon başına günde 5, genelde dakikada 20 sipariş
  if (select count(*) from tasma_orders where (phone = v_phone or (v_device is not null and device = v_device))
        and created_at > now() - interval '1 day') >= 5
    then return json_build_object('ok', false, 'error', 'too_many'); end if;
  if (select count(*) from tasma_orders where created_at > now() - interval '1 minute') >= 20
    then return json_build_object('ok', false, 'error', 'busy'); end if;
  loop
    v_code := 'TQ-' || translate(upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), '01', 'XY');
    exit when not exists (select 1 from tasma_orders where code = v_code);
  end loop;
  insert into tasma_orders (code, tag_code, design, full_name, phone, email, city, district, address, note, amount, device)
    values (v_code, v_tag, v_design, v_name, v_phone, v_email, v_city, v_district, v_address, v_note, s.price, v_device)
    returning * into o;
  return json_build_object('ok', true, 'code', o.code, 'token', o.token, 'amount', o.amount, 'status', o.status);
end $$;

-- Müşteri "ödemeyi yaptım" der
create or replace function public.tasma_order_paid(p_code text, p_token uuid)
returns json
language plpgsql security definer set search_path = public
as $$
declare o tasma_orders;
begin
  update tasma_orders set status = 'odeme_bildirildi', paid_at = now(), updated_at = now()
    where code = upper(trim(p_code)) and token = p_token and status = 'odeme_bekleniyor'
    returning * into o;
  if not found then
    select * into o from tasma_orders where code = upper(trim(p_code)) and token = p_token;
    if not found then return json_build_object('ok', false, 'error', 'not_found'); end if;
  end if;
  return json_build_object('ok', true, 'status', o.status);
end $$;

-- Müşteri kendi siparişlerinin durumunu sorgular: [{code, status, tracking}]
create or replace function public.tasma_order_status(p_codes text[], p_tokens uuid[])
returns json
language sql stable security definer set search_path = public
as $$
  select coalesce(json_agg(json_build_object('code', o.code, 'status', o.status, 'tracking', o.tracking)), '[]'::json)
  from unnest(p_codes, p_tokens) as q(code, token)
  join tasma_orders o on o.code = upper(trim(q.code)) and o.token = q.token;
$$;

create or replace function public.tasma_admin_shop_get(p_key text)
returns setof public.tasma_shop_settings
language plpgsql security definer set search_path = public
as $$
begin
  perform public.tasma_admin_check(p_key);
  return query select * from tasma_shop_settings where id = 1;
end $$;

create or replace function public.tasma_admin_shop_set(p_key text, p_active boolean, p_price integer, p_iban text,
  p_account_name text, p_bank_name text, p_printer_email text, p_shipping_text text, p_product_text text,
  p_telegram_bot_token text, p_telegram_chat_id text, p_resend_api_key text, p_notify_email text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.tasma_admin_check(p_key);
  update tasma_shop_settings set
    active = coalesce(p_active, false),
    price = greatest(coalesce(p_price, 150), 0),
    iban = nullif(upper(regexp_replace(coalesce(p_iban, ''), '\s', '', 'g')), ''),
    account_name = nullif(trim(coalesce(p_account_name, '')), ''),
    bank_name = nullif(trim(coalesce(p_bank_name, '')), ''),
    printer_email = nullif(trim(coalesce(p_printer_email, '')), ''),
    shipping_text = coalesce(nullif(trim(coalesce(p_shipping_text, '')), ''), 'Kargo ücreti fiyata dahildir.'),
    product_text = coalesce(nullif(trim(coalesce(p_product_text, '')), ''), product_text),
    telegram_bot_token = nullif(trim(coalesce(p_telegram_bot_token, '')), ''),
    telegram_chat_id = nullif(trim(coalesce(p_telegram_chat_id, '')), ''),
    resend_api_key = nullif(trim(coalesce(p_resend_api_key, '')), ''),
    notify_email = nullif(trim(coalesce(p_notify_email, '')), ''),
    updated_at = now()
  where id = 1;
end $$;

-- Deneme bildirimi: {sent: gönderildi mi, pg_net: eklenti var mı}
create or replace function public.tasma_admin_notify_test(p_key text)
returns json
language plpgsql security definer set search_path = public
as $$
begin
  perform public.tasma_admin_check(p_key);
  return json_build_object('pg_net', to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') is not null,
    'sent', public.tasma_notify('Tasma QR: deneme bildirimi', 'Bildirimler çalışıyor. Yeni ödeme bildirimleri buraya gelecek.'));
end $$;

-- Siparişler, basılacak künyedeki köpek adıyla birlikte
create or replace function public.tasma_admin_orders(p_key text)
returns json
language plpgsql security definer set search_path = public
as $$
begin
  perform public.tasma_admin_check(p_key);
  return (select coalesce(json_agg(x order by x.created_at desc), '[]'::json)
    from (select o.*, t.pet_name from tasma_orders o left join tasma_tags t on t.code = o.tag_code) x);
end $$;

create or replace function public.tasma_admin_order_update(p_key text, p_id bigint, p_status text, p_tracking text, p_admin_note text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.tasma_admin_check(p_key);
  update tasma_orders set status = p_status, tracking = nullif(trim(coalesce(p_tracking, '')), ''),
    admin_note = nullif(trim(coalesce(p_admin_note, '')), ''), updated_at = now()
  where id = p_id;
end $$;

-- ---------------------------------------------------------------- yetkiler: herkese açık API (anon) yalnızca bu fonksiyonları çağırabilir
do $$
declare f text;
begin
  foreach f in array array[
    'tasma_version()',
    'tasma_tag_create(text, text, text)',
    'tasma_tag_lookup(text)',
    'tasma_tag_save(text, text, text, text, text, boolean, text, text, text, boolean)',
    'tasma_tag_set_lost(text, text, boolean)',
    'tasma_report_location(text, double precision, double precision, integer)',
    'tasma_tag_stats(text[], text[])',
    'tasma_admin_list(text)',
    'tasma_admin_add(text, integer)',
    'tasma_admin_set_given(text, text[], boolean)',
    'tasma_request_create(text, text, text, text, text, text)',
    'tasma_admin_requests(text)',
    'tasma_admin_request_update(text, bigint, text, text)',
    'tasma_shop_info()',
    'tasma_order_create(text, text, text, text, text, text, text, text, text, text)',
    'tasma_order_paid(text, uuid)',
    'tasma_order_status(text[], uuid[])',
    'tasma_admin_shop_get(text)',
    'tasma_admin_shop_set(text, boolean, integer, text, text, text, text, text, text, text, text, text, text)',
    'tasma_admin_notify_test(text)',
    'tasma_admin_orders(text)',
    'tasma_admin_order_update(text, bigint, text, text, text)'
  ] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
end $$;
