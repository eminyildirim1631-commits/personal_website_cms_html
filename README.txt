EMİN YILDIRIM - KİŞİSEL SİTE VE CMS (GitHub Pages sürümü, sunucu gerektirmez)

Bu klasör tamamen statik HTML/CSS/JS'dir. Node.js, server.js veya "node server.js" GEREKMEZ.
Sayfalar açılınca içerik (projeler, galeri, blog, metinler) tarayıcıdan doğrudan Supabase'ten okunur.
Yönetim paneli de tarayıcıdan, Supabase kullanıcınla giriş yaparak çalışır.

KURULUM (bir kez)
1) Supabase > SQL Editor > New query: supabase-github.sql dosyasının tamamını yapıştır, Run'a bas.
   En altta yönetici e-postan görünmeli. (supabase.sql'i daha önce çalıştırmadıysan önce onu çalıştır.)
2) Supabase > Authentication > Sign In / Providers: "Allow new users to sign up" KAPALI olmalı.
3) Supabase > Authentication > URL Configuration > Site URL: GitHub Pages adresini yaz
   (ör. https://kullaniciadin.github.io/repo-adi/). Şart değil ama önerilir.

GITHUB'A YÜKLEME
1) Bu klasörün İÇİNDEKİ tüm dosyaları (index.html en üst seviyede olacak şekilde) repoya yükle.
   .nojekyll dosyası da gitsin.
2) Repo > Settings > Pages > Source: "Deploy from a branch", Branch: main, Folder: / (root) > Save.
3) 1-2 dakika sonra site: https://kullaniciadin.github.io/repo-adi/
   Panel:            https://kullaniciadin.github.io/repo-adi/admin/

GÜVENLİK
config.js içindeki "sb_publishable_..." anahtarı tarayıcıda kullanılmak için yapılmıştır, herkese açık olması sorun değil.
Yetkiyi Supabase'teki RLS kuralları belirler: ziyaretçi sadece okur ve mesaj gönderir, yazma işini sadece yönetici yapar.
"sb_secret_..." anahtarını ve .env dosyasını ASLA GitHub'a yükleme. Bu sürümde onlara ihtiyaç yok.
Daha önce .env'i GitHub'a yüklediysen: Supabase > Settings > API Keys'te secret key'i sil/yenile.

BİLGİSAYARDA DENEMEK
index.html'e çift tıklamak yerine klasörü küçük bir sunucuyla açman daha sağlıklı olur, ör. VS Code "Live Server".

DOSYALAR
index/about/projects/gallery/blog/contact.html  sayfalar ({{...}} yerleri Supabase verisiyle doldurulur)
config.js   Supabase adresi + publishable key
cms.js      Supabase okuma/yazma, panel ve iletişim formu
render.js   sayfaları veriyle dolduran kod
app.js, style.css, img/   tasarım, dil değiştirme, menü
admin/      yönetim paneli
FOTOĞRAF: vesikalık için img/vesikalik.jpg koy.
