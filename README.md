# AI CV Analizi

Yapay zeka destekli CV analiz ve değerlendirme platformu.

## Teknolojiler

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4 API

## Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Environment değişkenlerini ayarlayın:**

`.env.local` dosyasını oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

3. **Supabase projesini oluşturun:**

- [Supabase](https://supabase.com) hesabı oluşturun
- Yeni bir proje oluşturun
- Project Settings > API'den URL ve ANON KEY'i alın
- SQL Editor'de `supabase/migrations/20250126000000_initial_schema.sql` dosyasını çalıştırın

4. **Development sunucusunu başlatın:**
```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## Veritabanı Şeması

### Tables:
- **users**: Kullanıcı profilleri
- **cv_analyses**: CV yükleme ve analiz kayıtları
- **analysis_results**: AI analiz sonuçları
- **user_credits**: Kullanıcı kredileri (gelecek için)

Detaylı şema için `supabase/migrations/20250126000000_initial_schema.sql` dosyasına bakın.

## Proje Yapısı

```
aicv/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Ana sayfa
│   └── globals.css        # Global styles
├── components/            # React bileşenleri
├── lib/                   # Utility fonksiyonlar
│   ├── supabase/         # Supabase client setup
│   ├── types/            # TypeScript type definitions
│   └── utils.ts          # Helper fonksiyonlar
├── supabase/
│   └── migrations/       # Database migrations
├── public/               # Static dosyalar
└── middleware.ts         # Next.js middleware (auth)
```

## Özellikler

### Mevcut Özellikler (v0.1)
- ✅ Next.js 14 + TypeScript kurulumu
- ✅ Tailwind CSS + shadcn/ui entegrasyonu
- ✅ Supabase kurulumu ve yapılandırması
- ✅ Veritabanı şeması oluşturma
- ✅ Authentication middleware
- ✅ Temel sayfa yapısı

### Gelecek Özellikler
- [ ] Landing page tasarımı
- [ ] Kullanıcı kayıt/giriş sistemi
- [ ] CV yükleme fonksiyonu
- [ ] OpenAI entegrasyonu
- [ ] AI analiz motoru
- [ ] Sonuç gösterimi (charts, scores)
- [ ] Geçmiş analizler
- [ ] Dashboard

## Komutlar

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

## Detaylı Dokümantasyon

Proje gereksinimleri ve teknik detaylar için [prd.md](prd.md) dosyasına bakın.

## Lisans

ISC
