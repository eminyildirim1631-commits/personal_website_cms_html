-- EMİN YILDIRIM CMS - GitHub Pages (sunucusuz) sürümü için ek güvenlik kuralları
-- Önce supabase.sql'i (daha önce çalıştırdıysan gerek yok), sonra BU dosyanın tamamını
-- Supabase > SQL Editor > New query'ye yapıştırıp Run'a bas. Tekrar çalıştırılabilir, veri silmez.
--
-- Neden gerekli: Artık sunucu (server.js) ve secret key yok. Panel doğrudan tarayıcıdan,
-- giriş yapan kullanıcının oturumuyla Supabase'e yazar. Bu kurallar yazma iznini SADECE
-- "admins" listesindeki kullanıcılara verir; ziyaretçiler sadece okuyabilir ve mesaj gönderebilir.

-- 1) Yönetici listesi. Şu an Authentication > Users'ta olan herkes yönetici olarak eklenir.
--    (Sonradan yeni bir kullanıcı eklersen bu dosyayı tekrar çalıştır.)
create table if not exists public.admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security; -- kural yok = API'den kimse okuyamaz/yazamaz
insert into public.admins(user_id) select id from auth.users on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admins where user_id = auth.uid()) $$;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) İçerik tabloları: yönetici her şeyi yapabilir (okuma kuralları supabase.sql'de, herkese açık)
drop policy if exists "panel ayarlar" on site_settings;
create policy "panel ayarlar" on site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "panel projeler" on projects;
create policy "panel projeler" on projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "panel galeri" on gallery;
create policy "panel galeri" on gallery for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "panel yazilar" on posts;
create policy "panel yazilar" on posts for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3) Mesajlar: ziyaretçi sadece gönderebilir (okuyamaz), yönetici okur ve siler
drop policy if exists "ziyaretci mesaj gonderir" on messages;
create policy "ziyaretci mesaj gonderir" on messages for insert to anon, authenticated
with check (
  char_length(coalesce(name,'')) between 1 and 200
  and char_length(coalesce(email,'')) between 3 and 200 and email ~ '^\S+@\S+\.\S+$'
  and char_length(coalesce(subject,'')) <= 200
  and char_length(coalesce(message,'')) between 1 and 4000
);
drop policy if exists "panel mesaj okur" on messages;
create policy "panel mesaj okur" on messages for select to authenticated using (public.is_admin());
drop policy if exists "panel mesaj siler" on messages;
create policy "panel mesaj siler" on messages for delete to authenticated using (public.is_admin());

-- 4) Görseller (images deposu): herkes görür (public bucket), yönetici yükler/listeler/siler
drop policy if exists "panel gorsel listeler" on storage.objects;
create policy "panel gorsel listeler" on storage.objects for select to authenticated using (bucket_id = 'images' and public.is_admin());
drop policy if exists "panel gorsel yukler" on storage.objects;
create policy "panel gorsel yukler" on storage.objects for insert to authenticated with check (bucket_id = 'images' and public.is_admin());
drop policy if exists "panel gorsel siler" on storage.objects;
create policy "panel gorsel siler" on storage.objects for delete to authenticated using (bucket_id = 'images' and public.is_admin());

-- Kontrol: yönetici olarak eklenen kullanıcılar
select u.email as yonetici from public.admins a join auth.users u on u.id = a.user_id;
