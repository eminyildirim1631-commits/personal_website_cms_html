-- EMİN YILDIRIM CMS - Supabase kurulumu
-- Supabase > SQL Editor > New query: bu dosyanın tamamını yapıştır ve Run'a bas.
-- Birden fazla kez çalıştırılabilir; var olan verilerini silmez.

-- 1) Tablolar
create table if not exists site_settings(key text primary key, tr text, en text);
create table if not exists projects(id uuid primary key default gen_random_uuid(), title_tr text, title_en text, desc_tr text, desc_en text, tags_tr text, tags_en text, image_url text, sort int default 0, created_at timestamptz default now());
create table if not exists gallery(id uuid primary key default gen_random_uuid(), title_tr text, title_en text, desc_tr text, desc_en text, image_url text, sort int default 0, created_at timestamptz default now());
create table if not exists posts(id uuid primary key default gen_random_uuid(), title_tr text, title_en text, body_tr text, body_en text, cats_tr text, cats_en text, tags_tr text, tags_en text, published boolean default true, created_at timestamptz default now());
create table if not exists messages(id uuid primary key default gen_random_uuid(), name text, email text, subject text, message text, created_at timestamptz default now());
alter table projects add column if not exists featured boolean default false;
alter table posts add column if not exists sort int default 0;

-- 2) Güvenlik (RLS): ziyaretçiler sadece okuyabilir. Yazma işini sunucu secret key ile yapar.
alter table site_settings enable row level security;
alter table projects enable row level security;
alter table gallery enable row level security;
alter table posts enable row level security;
alter table messages enable row level security;
drop policy if exists "herkes ayarlari okur" on site_settings;
create policy "herkes ayarlari okur" on site_settings for select to anon, authenticated using (true);
drop policy if exists "herkes projeleri okur" on projects;
create policy "herkes projeleri okur" on projects for select to anon, authenticated using (true);
drop policy if exists "herkes galeriyi okur" on gallery;
create policy "herkes galeriyi okur" on gallery for select to anon, authenticated using (true);
drop policy if exists "herkes yayindaki yazilari okur" on posts;
create policy "herkes yayindaki yazilari okur" on posts for select to anon, authenticated using (published);
-- Önceki kurulumdan kalan, giriş yapan herkese yazma izni veren kurallar kaldırılır:
drop policy if exists "admin yazilar" on posts;
drop policy if exists "admin projeler" on projects;
drop policy if exists "admin galeri" on gallery;
drop policy if exists "admin mesajlar" on messages;
drop policy if exists "herkes mesaj gonderir" on messages;

-- 3) Görsel deposu (herkese açık okuma; yükleme/silme sadece sunucudan)
insert into storage.buckets (id, name, public) values ('images', 'images', true) on conflict (id) do update set public = true;
drop policy if exists "herkes gorselleri gorur" on storage.objects;
drop policy if exists "admin gorsel yukler" on storage.objects;

-- 4) Başlangıç içeriği (sadece tablolar boşsa eklenir)
insert into site_settings(key,tr,en) values('hero_pre','Merhaba, ben','Hi, I''m') on conflict (key) do nothing;
insert into site_settings(key,tr,en) values('hero_name','Emin Yıldırım.','Emin Yıldırım.') on conflict (key) do nothing;
insert into site_settings(key,tr,en) values('hero_k','Bilgisayar Programcılığı Öğrencisi & Dijital Üretici.','Computer Programming Student & Digital Creator.') on conflict (key) do nothing;
insert into site_settings(key,tr,en) values('hero_d','Dijital tasarım, görsel iletişim ve multimedya üretimiyle ilgileniyorum. Fikirleri estetik ve işlevsel dijital deneyimlere dönüştürüyorum.','I focus on digital design, visual communication and multimedia production, turning ideas into clean, functional digital experiences.') on conflict (key) do nothing;
insert into site_settings(key,tr,en) values('about_sum','Akdeniz Üniversitesi Bilgisayar Programcılığı öğrencisiyim. Grafik tasarım, hareketli grafikler ve web teknolojileri alanlarında kendimi geliştiriyor, ürettiğim projeleri bu portfolyoda bir araya getiriyorum.','I am a Computer Programming student at Akdeniz University. I''m developing myself in graphic design, motion graphics and web technologies, and I gather my work in this portfolio.') on conflict (key) do nothing;
insert into site_settings(key,tr,en) values('addr','Hasanköy Mah. İstasyon Cad. No:1/1, Gürsu / Bursa','Hasanköy Mah. İstasyon Cad. No:1/1, Gürsu / Bursa, Turkey') on conflict (key) do nothing;
insert into site_settings(key,tr,en) values('phone','0537 941 47 74','0537 941 47 74') on conflict (key) do nothing;
insert into site_settings(key,tr,en) values('email','eminyildirim1607@gmail.com','eminyildirim1607@gmail.com') on conflict (key) do nothing;
insert into projects(title_tr,title_en,desc_tr,desc_en,tags_tr,tags_en,featured,sort)
select * from (values
('Kısa Tanıtım Filmi ve Ses Kurgu Projesi','Short Promo Film & Audio Editing Project','Multimedya Uygulamaları: Çoklu kamera çekimlerinin senkronizasyonu, alt yazı tasarımı, ses miksajı ve renk düzenlemesi yapılan multimedya prodüksiyonu.','Multimedia Applications: A multimedia production with multi-camera synchronization, lower-third graphics, audio mixing and color correction.','Multimedya,Multicam,Video kurgu','Multimedia,Multicam,Video editing',true,0),
('Kişisel Portfolyo Web Sitesi','Personal Portfolio Website','Modern tasarım ilkeleriyle hazırlanan, mobil uyumlu ve çift dilli kişisel tanıtım web sitesi. Sonraki aşamada kendi içerik yönetim sistemini (CMS) yazacağım.','A responsive, bilingual personal website built with modern layout and typography principles. Next, I''ll build my own content management system (CMS) for it.','HTML,CSS,JavaScript','HTML,CSS,JavaScript',true,1),
('Vektörel Karakter ve Sahne Tasarımı','Vector Character & Scene Design','Grafik Animasyon 1: Adobe Illustrator kullanılarak geometrik formlar, ışık-gölge dengesi ve renk harmonisi prensipleriyle hazırlanan illüstrasyon çalışması.','Graphic Animation 1: An illustration project made in Adobe Illustrator, focusing on geometric forms, light-shadow balance and color harmony.','Grafik Animasyon 1,Adobe Illustrator,İllüstrasyon','Graphic Animation 1,Adobe Illustrator,Illustration',false,2),
('Tipografik Hareketli Afiş','Kinetic Typography Poster','Grafik Animasyon 2: Temel zamanlama (timing) ve akış (easing) kuralları uygulanarak oluşturulan döngüsel dijital afiş animasyonu.','Graphic Animation 2: A looping digital poster animation built with foundational timing and easing principles.','Grafik Animasyon 2,Motion poster,Tipografi','Graphic Animation 2,Motion poster,Typography',false,3)) v where not exists (select 1 from projects);
insert into gallery(title_tr,title_en,desc_tr,desc_en,sort)
select * from (values
('Sabah Işığı ve Mimari','Morning Light & Architecture','Şehir yürüyüşlerimde yakaladığım geometrik gölgeler ve minimal detaylar.','Geometric shadows and minimal details captured during city walks.',0),
('Çalışma Masam ve Eskizler','Desk & Sketchbook','Yeni bir tasarım projesine başlamadan önceki fikir geliştirme sürecim.','My brainstorming setup before starting a new design project.',1),
('Doğada Perspektif','Perspective in Nature','Renk paletlerime ilham veren gün batımı tonları ve doğal dokular.','Sunset tones and natural textures that inspire my color palettes.',2),
('Set Arkası / Çekim Anı','Behind the Scenes','Multimedya uygulamaları dersindeki video çekim sürecinden bir kare.','A snapshot from the video shoot in my Multimedia Applications course.',3),
('Spor','Sport','Spor, vücudumu geliştirmemi ve stres atmamı sağlıyor.','Sport helps me build my body and let off stress.',4),
('Formula 1','Formula 1','Yarış hafta sonlarının vazgeçilmezi.','Race weekends are a must for me.',5)) v where not exists (select 1 from gallery);
insert into posts(title_tr,title_en,body_tr,body_en,cats_tr,cats_en,tags_tr,tags_en,sort)
select * from (values
('Adobe Premiere Pro''da Multicam (Çoklu Kamera) Kullanımı','Using Multicam in Adobe Premiere Pro','Birden fazla kamerayla çekilen röportaj, konser veya ders videolarını tek tek kesip senkronize etmek ciddi zaman kaybına yol açar. Adobe Premiere Pro''nun Multicam (Çoklu Kamera) özelliği, tüm görüntüleri tek bir ses izi üzerinden otomatik olarak eşleştirerek kurgu sürecini hızlandırır.

Kullanmak için proje panelinde aynı sahneye ait video ve ses dosyalarını seçip sağ tıklayın ve Create Multi-Camera Source Sequence seçeneğine tıklayın. Senkronizasyon noktası olarak Audio seçeneğini işaretlediğinizde Premiere dalga formlarını analiz ederek klipleri hizalar. Oluşan sekansı zaman çizelgesine (Timeline) sürükleyip Program monitöründeki Multi-Camera View ikonunu aktif ettiğinizde, video oynarken klavyedeki 1 2 3 tuşlarıyla canlı yayın yönetmeni gibi kameralar arasında anında geçiş yapabilirsiniz.','Manually syncing and cutting interviews, concerts or multi-angle shoots can consume hours of editing time. Adobe Premiere Pro''s Multicam feature automatically aligns multiple camera angles using a shared audio track, streamlining the whole post-production workflow.

To get started, select all clips from the same take in the Project panel, right-click, and choose Create Multi-Camera Source Sequence. Set the synchronization point to Audio so Premiere aligns the waveforms automatically. Drag the generated sequence onto your timeline, enable Multi-Camera View in the Program Monitor, and press 1 2 3 during playback to switch camera angles in real time.','Videografi, Animasyon','Videography, Animation','Adobe, Premiere, video kurgu, multicam','Adobe, Premiere, video editing, multicam',0),
('Web Tasarımında Renk Hiyerarşisi ve Tipografi Seçimi','Color Hierarchy and Typography in Web Design','İyi bir web sitesinin ziyaretçide bıraktığı ilk izlenim, kullanılan görsellerden önce tipografi ve renk dengesine dayanır. Tasarımda 60-30-10 kuralını uygulamak görsel karmaşayı önler: sayfanın %60''ı ana arka plan rengi, %30''u ikincil yüzey rengi ve %10''u ise butonlar ile önemli vurgular için ayrılan aksan rengi olmalıdır.

Tipografide ise ekranda okunabilirliği yüksek sans-serif yazı tiplerini tercih etmek ve başlıklarla gövde metni arasında net bir boyut hiyerarşisi kurmak gerekir. Satır yüksekliğini (line-height) metin boyutunun ortalama 1.5 katı tutmak, özellikle mobil cihazlarda göz yorgunluğunu azaltarak kullanıcı deneyimini doğrudan iyileştirir.','A website''s first impression relies heavily on typography and color balance even before a user processes the imagery. Applying the 60-30-10 rule prevents visual clutter: 60% dominant background color, 30% secondary surface color, and 10% accent color reserved for buttons and key highlights.

For typography, choosing high-legibility sans-serif fonts and establishing a clear scale between headings and body text is essential. Setting body line-height to roughly 1.5 times the font size reduces eye strain on mobile screens and directly improves readability.','Web Tasarım, UI/UX','Web Design, UI/UX','tipografi, renk teorisi, web tasarım, responsive','typography, color theory, web design, responsive',1),
('Hareketli Grafiklerde 12 Temel Animasyon Prensibi','The 12 Basic Principles of Animation in Motion Graphics','Dijital arayüzlerde veya tanıtım videolarında nesnelerin mekanik ve yapay görünmesini engellemenin yolu, klasik animasyon prensiplerini doğru uygulamaktan geçer. Özellikle Slow In ve Slow Out (Yavaş Giriş ve Yavaş Çıkış) prensibi, gerçek dünyadaki fizik kurallarını taklit ederek hareketin doğal bir ivmeyle başlayıp yumuşakça durmasını sağlar.

Bunun yanında Anticipation (Beklenti) ve Follow Through (Takip Hareketi) teknikleri, bir butonun büyümesinden bir logonun ekrana gelişine kadar her mikro etkileşime canlılık katar. Keyframe eğrilerini (Graph Editor) düzenlemek, basit bir şekil animasyonunu bile profesyonel bir prodüksiyon seviyesine taşır.','Preventing objects from looking stiff or robotic in digital interfaces and promotional videos comes down to applying classic animation principles. In particular, Slow In and Slow Out (easing) mimics real-world physics, letting motion accelerate naturally and decelerate smoothly.

Alongside easing, Anticipation and Follow Through bring life to every micro-interaction, from a button hover state to a logo reveal. Refining keyframe curves in the Graph Editor lifts even simple geometric motion into polished, professional work.','Animasyon, Grafik Tasarım','Animation, Graphic Design','animasyon, motion graphics, after effects, tasarım','animation, motion graphics, after effects, design',2)) v where not exists (select 1 from posts);

-- Önceki kurulumda yazılar sıra numarası olmadan eklendiyse, tarihe göre sırala:
update posts set sort = s.n from (select id, row_number() over (order by created_at desc) - 1 as n from posts) s where posts.id = s.id and (select count(distinct sort) from posts) = 1;

-- Hiçbir proje öne çıkarılmamışsa ilk ikisini anasayfada göster:
update projects set featured = true where id in (select id from projects order by sort, created_at limit 2) and not exists (select 1 from projects where featured);

-- Kontrol: aşağıdaki sorgu 5 tabloyu ve satır sayılarını gösterir.
select 'site_settings' tablo, count(*) from site_settings union all select 'projects', count(*) from projects
union all select 'gallery', count(*) from gallery union all select 'posts', count(*) from posts union all select 'messages', count(*) from messages;
