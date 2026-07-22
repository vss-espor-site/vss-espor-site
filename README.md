# PUBG Mobile e-Spor Toplulugu — Web Sitesi

Next.js 14 (App Router) + Prisma + PostgreSQL + NextAuth + Anthropic Claude AI
ile hazirlanmis, koyu tema / neon yesil-sari PUBG Mobile e-spor tarzinda
profesyonel bir topluluk sitesi.

## Ozellikler
- Mobil ve masaustu uyumlu, koyu temali tasarim
- Kayit sistemi: Ad, Soyad, Yas, PUBG ID, Instagram/TikTok toplulugu
- Yas girildiginde otomatik yas grubu atanir (13-15 / 16-18 / 19-24 / 25+)
- Oyuncu profilleri (listeleme, filtreleme, detay sayfasi)
- Turnuva sistemi (olusturma, listeleme, katilim, durum yonetimi)
- Duyuru sistemi (sabitlenebilir duyurular)
- Admin paneli — **sadece senin .env dosyanda tanimladigin e-posta** ile giris yapilabilir
- AI destekli sohbet asistani (Anthropic Claude API ile, site verilerini baglam olarak kullanir)
- PostgreSQL veritabani (Prisma ORM)

---

## 1) Kurulum (yerel bilgisayarinda)

```bash
npm install
```

## 2) Veritabani

Ucretsiz bir PostgreSQL veritabani olusturmak icin:
- https://neon.tech (onerilen, hizli ve ucretsiz)
- https://supabase.com

Baglanti dizesini kopyalayip `.env` dosyasindaki `DATABASE_URL` degerine yapistir.

`.env.example` dosyasini kopyalayip `.env` olarak adlandir:

```bash
cp .env.example .env
```

Sonra semayi veritabanina uygula:

```bash
npx prisma db push
```

## 3) Admin hesabini olustur (SADECE SEN)

Sitede kayit ile olusan bir admin hesabi YOKTUR — bilerek boyle tasarlandi.
Admin girisi tamamen `.env` dosyandaki iki degere baglidir:

1. `.env` dosyasinda `ADMIN_EMAIL` degerine kendi mailini yaz.
2. Sifreni hashle:
   ```bash
   node scripts/hash-password.js "SifreN"
   ```
3. Ciktiyi `.env` dosyasindaki `ADMIN_PASSWORD_HASH` degerine yapistir.

Bu sayede **sadece bu e-posta ve sifre kombinasyonuyla** `/admin/login`
sayfasindan giris yapilabilir; baska kimse admin paneline ve hicbir
duzenleme/silme islemine erisemez (tum admin API uclari oturum kontrolu yapar).

## 4) AI sohbet asistani

[https://console.anthropic.com](https://console.anthropic.com) adresinden bir
API anahtari al ve `.env` dosyasindaki `ANTHROPIC_API_KEY` degerine yapistir.

## 5) NextAuth gizli anahtari

```bash
openssl rand -base64 32
```
Ciktiyi `.env` dosyasindaki `NEXTAUTH_SECRET` degerine yapistir.

## 6) Siteyi calistir

```bash
npm run dev
```

Site `http://localhost:3000` adresinde acilir.
Admin paneli: `http://localhost:3000/admin/login`

---

## 7) Yayina alma (Vercel)

1. Projeyi bir GitHub reposuna yukle.
2. [vercel.com](https://vercel.com) uzerinden repoyu import et.
3. Vercel proje ayarlarinda **Environment Variables** kismina `.env`
   dosyandaki tum degerleri tek tek ekle (`NEXTAUTH_URL` degerini yayindaki
   gercek domain adresin olarak guncelle, orn. `https://takimin.com`).
4. Deploy et. Vercel otomatik olarak `npm run build` calistirir
   (bu komut `prisma generate` adimini da icerir).

Not: PostgreSQL veritabanin (Neon/Supabase) Vercel'in sunucularindan
erisilebilir oldugundan (varsayilan olarak oyle) baska bir islem gerekmez.

---

## Proje yapisi (ozet)

```
src/app/                → sayfalar (App Router)
src/app/api/            → API uclari (register, players, tournaments, announcements, chat, auth)
src/app/admin/          → admin paneli (sadece giris yapan admin gorur)
src/components/         → Navbar, Footer, ChatWidget, Providers
src/lib/                → prisma client, auth ayarlari, yas grubu hesaplama
prisma/schema.prisma    → veritabani semasi
scripts/hash-password.js→ admin sifresini hashlemek icin yardimci script
```

## Guvenlik notu
- Kayit sistemi herkese acik (topluluk uyeligi icin), ancak **duzenleme/silme
  islemleri** (oyuncu silme, turnuva olusturma/silme, duyuru yayinlama/silme)
  yalnizca giris yapmis admin oturumuyla calisir — bu API'ler sunucu tarafinda
  `getServerSession` ile kontrol edilir, sadece arayuzde gizlenmez.
- `/admin/*` altindaki tum sayfalar `middleware.ts` ile korunur; oturum
  yoksa otomatik olarak `/admin/login` sayfasina yonlendirilir.
