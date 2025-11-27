# AI CV Analizi - Proje Raporu

**Son Güncelleme:** 2025-01-27  
**Proje Versiyonu:** 1.0  
**Durum:** Aktif Geliştirme

---

## 📋 İçindekiler

1. [Proje Özeti](#proje-özeti)
2. [Teknoloji Stack'i](#teknoloji-stacki)
3. [Proje Yapısı](#proje-yapısı)
4. [Veritabanı Şeması](#veritabanı-şeması)
5. [API Endpoints](#api-endpoints)
6. [Özellikler ve Fonksiyonellik](#özellikler-ve-fonksiyonellik)
7. [Kurulum ve Geliştirme](#kurulum-ve-geliştirme)
8. [Güvenlik ve Yetkilendirme](#güvenlik-ve-yetkilendirme)
9. [AI Entegrasyonu](#ai-entegrasyonu)
10. [Bilinen Sorunlar ve Gelecek Planlar](#bilinen-sorunlar-ve-gelecek-planlar)

---

## 🎯 Proje Özeti

**AI CV Analizi**, kullanıcıların CV'lerini yükleyip yapay zeka destekli analiz alabileceği, profesyonel geri bildirimler alacağı ve CV'lerini geliştirebileceği modern bir web platformudur.

### Temel Özellikler
- ✅ **CV Analizi**: PDF CV'leri yapay zeka ile analiz etme ve detaylı skorlama
- ✅ **Ön Yazı Oluşturucu**: İş ilanına özel kişiselleştirilmiş ön yazı oluşturma
- ✅ **İş Uyum Analizi**: CV ile iş ilanı arasındaki uyum skorunu hesaplama
- ✅ **CV Optimizasyonu**: İş ilanına göre CV'yi optimize etme
- ✅ **Kredi Sistemi**: Kullanıcı kredileri ile işlem yönetimi

### Hedef Kitle
- İş arayanlar
- Kariyerini geliştirmek isteyen profesyoneller
- Üniversite öğrencileri ve yeni mezunlar
- Kariyer danışmanları

---

## 🛠 Teknoloji Stack'i

### Frontend
- **Framework**: Next.js 16.0.4 (App Router)
- **UI Library**: React 19.2.0
- **Dil**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.17
- **UI Components**: shadcn/ui (custom components)
- **Form Handling**: React Hook Form 7.66.1 + Zod 4.1.13
- **Icons**: Lucide React 0.554.0
- **Notifications**: Sonner 2.0.7
- **PDF/Image**: html2canvas 1.4.1, jspdf 3.0.4
- **Markdown**: react-markdown 10.1.0

### Backend
- **Framework**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (@supabase/ssr 0.7.0)
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4o API (openai 6.9.1)

### DevOps & Tools
- **Hosting**: Vercel (önerilen)
- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint 9.39.1

---

## 📁 Proje Yapısı

```
aicv/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── analyze-cv/          # CV analiz endpoint'i
│   │   ├── generate-cover-letter/ # Ön yazı oluşturma
│   │   ├── job-match/           # İş uyum analizi
│   │   │   ├── analyze/         # Analiz endpoint'i
│   │   │   └── [id]/            # Sonuç görüntüleme
│   │   ├── optimize-cv/         # CV optimizasyonu
│   │   └── cover-letters/       # Ön yazı CRUD
│   ├── auth/                     # Authentication sayfaları
│   │   ├── login/               # Giriş sayfası
│   │   └── signup/             # Kayıt sayfası
│   ├── dashboard/               # Kullanıcı dashboard'u
│   │   ├── page.tsx             # Ana dashboard
│   │   ├── analysis/            # CV analiz sonuçları
│   │   │   └── [id]/            # Detaylı analiz görüntüleme
│   │   ├── cover-letter/        # Ön yazı yönetimi
│   │   │   ├── page.tsx         # Ön yazı oluşturma
│   │   │   └── [id]/            # Ön yazı görüntüleme
│   │   ├── job-match/           # İş uyum analizi
│   │   │   ├── page.tsx         # Analiz oluşturma
│   │   │   └── [id]/            # Sonuç görüntüleme
│   │   └── optimized-cv/        # Optimize edilmiş CV'ler
│   │       └── [id]/            # Optimize CV görüntüleme
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global stiller
├── components/                  # React bileşenleri
│   ├── ui/                      # shadcn/ui bileşenleri
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   └── cv-upload.tsx            # CV yükleme bileşeni
├── lib/                         # Utility fonksiyonlar
│   ├── supabase/               # Supabase client'ları
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   ├── types/                  # TypeScript type definitions
│   │   └── database.ts         # Supabase DB types
│   └── utils.ts                # Helper fonksiyonlar
├── supabase/                    # Database migrations
│   └── migrations/
│       ├── 20250126000000_initial_schema.sql
│       └── 20250127000000_job_match_analyzer.sql
├── public/                     # Static dosyalar
├── scripts/                     # Yardımcı scriptler
│   └── setup-supabase.sh
├── package.json                 # Bağımlılıklar
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
├── postcss.config.mjs          # PostCSS config
├── components.json             # shadcn/ui config
├── README.md                    # Temel dokümantasyon
├── prd.md                      # Product Requirements Document
└── SETUP_NOTES.md              # Kurulum notları
```

---

## 🗄 Veritabanı Şeması

### Tablolar

#### 1. `users`
Kullanıcı profilleri (Supabase Auth ile entegre)

```sql
- id: UUID (PK, FK -> auth.users)
- email: TEXT (UNIQUE, NOT NULL)
- full_name: TEXT (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**RLS Policies:**
- Kullanıcılar sadece kendi profillerini görebilir/güncelleyebilir

#### 2. `cv_analyses`
CV yükleme ve analiz kayıtları

```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- file_name: TEXT (NOT NULL)
- file_url: TEXT (NOT NULL) -- Supabase Storage path
- file_size: INTEGER
- status: TEXT ('pending' | 'processing' | 'completed' | 'failed')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**RLS Policies:**
- Kullanıcılar sadece kendi CV analizlerini görebilir/oluşturabilir/güncelleyebilir/silebilir

**İndeksler:**
- `idx_cv_analyses_user_id` (user_id)
- `idx_cv_analyses_status` (status)
- `idx_cv_analyses_created_at` (created_at DESC)

#### 3. `analysis_results`
AI analiz sonuçları

```sql
- id: UUID (PK)
- cv_analysis_id: UUID (FK -> cv_analyses)
- overall_score: INTEGER (0-100)
- summary: TEXT
- strengths: JSONB (string array)
- weaknesses: JSONB (string array)
- improvements: JSONB (string array)
- section_scores: JSONB (object)
  {
    contact_info: number,
    summary: number,
    experience: number,
    education: number,
    skills: number,
    formatting: number
  }
- keywords: JSONB (string array)
- ai_feedback: TEXT
- created_at: TIMESTAMP
```

**RLS Policies:**
- Kullanıcılar sadece kendi CV analizlerinin sonuçlarını görebilir

#### 4. `user_credits`
Kullanıcı kredileri

```sql
- id: UUID (PK)
- user_id: UUID (FK -> users, UNIQUE)
- credits: INTEGER (DEFAULT 3, >= 0)
- updated_at: TIMESTAMP
```

**RLS Policies:**
- Kullanıcılar sadece kendi kredilerini görebilir

**Trigger:**
- Yeni kullanıcı kaydında otomatik 3 kredi verilir (`handle_new_user`)

#### 5. `job_match_analyses`
İş uyum analizleri

```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- cv_analysis_id: UUID (FK -> cv_analyses)
- job_title: TEXT (NOT NULL)
- company_name: TEXT (nullable)
- job_description: TEXT (NOT NULL, max 10000 chars)
- job_source_url: TEXT (nullable)
- status: TEXT ('pending' | 'processing' | 'completed' | 'failed')
- match_score: INTEGER (0-100)
- missing_skills: JSONB (string array)
- existing_strengths: JSONB (string array)
- recommendations: JSONB (string array)
- keyword_analysis: JSONB (object)
- detailed_feedback: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**RLS Policies:**
- Kullanıcılar sadece kendi analizlerini görebilir/oluşturabilir/güncelleyebilir/silebilir

#### 6. `optimized_cvs`
Optimize edilmiş CV'ler

```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- job_match_analysis_id: UUID (FK -> job_match_analyses)
- optimized_content: TEXT (NOT NULL) -- Markdown formatında
- optimization_notes: JSONB (string array)
- status: TEXT ('pending' | 'processing' | 'completed' | 'failed')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**RLS Policies:**
- Kullanıcılar sadece kendi optimize CV'lerini görebilir/oluşturabilir

#### 7. `cover_letters`
Ön yazılar

```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- cv_analysis_id: UUID (FK -> cv_analyses)
- job_title: TEXT (NOT NULL)
- company_name: TEXT (nullable)
- job_description: TEXT (NOT NULL)
- language: TEXT ('tr' | 'en')
- generated_letter: TEXT
- status: TEXT ('pending' | 'processing' | 'completed' | 'failed')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Fonksiyonlar ve Trigger'lar

#### `handle_new_user()`
Yeni kullanıcı kaydında otomatik olarak:
- `users` tablosuna profil oluşturur
- `user_credits` tablosuna 3 kredi ekler

#### `handle_updated_at()`
`updated_at` alanını otomatik günceller (users, cv_analyses, user_credits, job_match_analyses, optimized_cvs)

#### `decrement_credits(user_uuid, credit_amount)`
Kullanıcı kredisini atomik olarak azaltır (min 0)

---

## 🔌 API Endpoints

### 1. CV Analizi

**POST** `/api/analyze-cv`

CV'yi analiz eder ve sonuçları kaydeder.

**Request Body:**
```json
{
  "analysisId": "uuid",
  "fileName": "user_id/timestamp.pdf"
}
```

**İşlem Akışı:**
1. CV analiz durumunu `processing` yapar
2. Supabase Storage'dan dosyayı indirir
3. OpenAI Assistants API ile PDF'den metin çıkarır
4. GPT-4o ile CV analizi yapar
5. Sonuçları `analysis_results` tablosuna kaydeder
6. Durumu `completed` yapar
7. Kullanıcı kredisinden 1 kredi düşer

**Response:**
```json
{
  "success": true,
  "analysisId": "uuid"
}
```

### 2. Ön Yazı Oluşturma

**POST** `/api/generate-cover-letter`

CV ve iş ilanına göre ön yazı oluşturur.

**Request Body:**
```json
{
  "cvAnalysisId": "uuid",
  "jobTitle": "string",
  "companyName": "string (optional)",
  "jobDescription": "string (max 5000 chars)",
  "language": "tr" | "en"
}
```

**İşlem Akışı:**
1. CV analizinin tamamlandığını doğrular
2. `cover_letters` tablosuna kayıt oluşturur
3. CV dosyasından metin çıkarır
4. GPT-4o ile ön yazı oluşturur
5. Sonucu kaydeder ve kredi düşer (1 kredi)

**Response:**
```json
{
  "success": true,
  "coverLetterId": "uuid"
}
```

### 3. İş Uyum Analizi

**POST** `/api/job-match/analyze`

CV ile iş ilanı arasındaki uyumu analiz eder.

**Request Body:**
```json
{
  "cvAnalysisId": "uuid",
  "jobTitle": "string",
  "companyName": "string (optional)",
  "jobDescription": "string (max 10000 chars)"
}
```

**İşlem Akışı:**
1. CV analizinin tamamlandığını doğrular
2. Kullanıcı kredisi kontrolü yapar
3. `job_match_analyses` tablosuna kayıt oluşturur
4. CV metnini çıkarır
5. GPT-4o ile uyum analizi yapar
6. Sonuçları kaydeder ve kredi düşer (1 kredi)

**Response:**
```json
{
  "success": true,
  "jobMatchId": "uuid"
}
```

### 4. CV Optimizasyonu

**POST** `/api/optimize-cv`

İş ilanına göre CV'yi optimize eder.

**Request Body:**
```json
{
  "jobMatchAnalysisId": "uuid"
}
```

**İşlem Akışı:**
1. İş uyum analizinin tamamlandığını doğrular
2. Kredi kontrolü yapar (2 kredi gerekli)
3. Daha önce optimize edilmiş mi kontrol eder
4. `optimized_cvs` tablosuna kayıt oluşturur
5. CV metnini çıkarır
6. GPT-4o ile CV optimizasyonu yapar
7. Sonucu kaydeder ve kredi düşer (2 kredi)

**Response:**
```json
{
  "success": true,
  "optimizedCvId": "uuid"
}
```

### 5. Ön Yazı Görüntüleme

**GET** `/api/cover-letters/[id]`

Belirli bir ön yazıyı getirir.

**Response:**
```json
{
  "id": "uuid",
  "job_title": "string",
  "company_name": "string | null",
  "generated_letter": "string",
  "language": "tr" | "en",
  "status": "completed",
  "created_at": "timestamp"
}
```

---

## ✨ Özellikler ve Fonksiyonellik

### Tamamlanan Özellikler ✅

#### 1. Kullanıcı Yönetimi
- ✅ Email/şifre ile kayıt olma (`/auth/signup`)
- ✅ Giriş yapma (`/auth/login`)
- ✅ Otomatik profil oluşturma
- ✅ Kredi sistemi (yeni kullanıcıya 3 kredi)

#### 2. CV Analizi
- ✅ PDF CV yükleme (drag & drop desteği)
- ✅ Dosya doğrulama (PDF, max 10MB)
- ✅ Supabase Storage'a yükleme
- ✅ OpenAI ile PDF metin çıkarma
- ✅ GPT-4o ile CV analizi
- ✅ 8 kategoride skorlama:
  - İletişim Bilgileri
  - Profesyonel Özet
  - İş Deneyimi
  - Eğitim
  - Beceriler
  - Format ve Tasarım
- ✅ Güçlü yönler listesi
- ✅ Geliştirilmesi gereken alanlar
- ✅ İyileştirme önerileri
- ✅ Anahtar kelime analizi
- ✅ Detaylı AI geri bildirimi
- ✅ Analiz geçmişi görüntüleme

#### 3. Ön Yazı Oluşturucu
- ✅ CV ve iş ilanına göre ön yazı oluşturma
- ✅ Türkçe ve İngilizce dil desteği
- ✅ Kişiselleştirilmiş içerik
- ✅ Ön yazı geçmişi görüntüleme

#### 4. İş Uyum Analizi
- ✅ CV ile iş ilanı karşılaştırması
- ✅ Uyum skoru hesaplama (0-100)
- ✅ Eksik beceri analizi
- ✅ Mevcut güçlü yönler
- ✅ Anahtar kelime eşleştirmesi
- ✅ Detaylı geri bildirim

#### 5. CV Optimizasyonu
- ✅ İş ilanına göre CV optimizasyonu
- ✅ Anahtar kelime optimizasyonu
- ✅ Optimizasyon notları
- ✅ Markdown formatında optimize CV

#### 6. Dashboard
- ✅ Kullanıcı dashboard'u
- ✅ Kredi durumu görüntüleme
- ✅ Analiz geçmişi
- ✅ Gerçek zamanlı durum güncellemeleri (polling)
- ✅ Toast bildirimleri

#### 7. Landing Page
- ✅ Modern ve responsive tasarım
- ✅ Hizmet tanıtımları
- ✅ Özellikler showcase
- ✅ Nasıl çalışır bölümü
- ✅ Testimonials

### Eksik/Geliştirilecek Özellikler 🔄

- [ ] Şifremi unuttum özelliği
- [ ] Email doğrulama
- [ ] Profil sayfası
- [ ] Kredi satın alma sistemi
- [ ] PDF rapor indirme
- [ ] Analiz karşılaştırma özelliği
- [ ] Sosyal medya paylaşımı
- [ ] LinkedIn profil analizi
- [ ] Çoklu dil desteği (i18n)
- [ ] Sektör bazlı özelleştirilmiş analizler
- [ ] CV şablon önerileri

---

## 🚀 Kurulum ve Geliştirme

### Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Supabase hesabı
- OpenAI API key

### Kurulum Adımları

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd aicv
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın:**

`.env.local` dosyası oluşturun:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

4. **Supabase veritabanını kurun:**
   - Supabase projesi oluşturun
   - SQL Editor'de migration dosyalarını sırayla çalıştırın:
     - `supabase/migrations/20250126000000_initial_schema.sql`
     - `supabase/migrations/20250127000000_job_match_analyzer.sql`
   - Storage bucket oluşturun: `cv-uploads` (public)

5. **Development sunucusunu başlatın:**
```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

### Komutlar

```bash
# Development
npm run dev

# Production build
npm run build

# Production sunucusu
npm start

# Linting
npm run lint
```

---

## 🔒 Güvenlik ve Yetkilendirme

### Row Level Security (RLS)

Tüm tablolarda RLS aktif ve kullanıcılar sadece kendi verilerine erişebilir:

- **users**: Kullanıcılar sadece kendi profillerini görebilir/güncelleyebilir
- **cv_analyses**: Kullanıcılar sadece kendi CV analizlerini yönetebilir
- **analysis_results**: Kullanıcılar sadece kendi analiz sonuçlarını görebilir
- **user_credits**: Kullanıcılar sadece kendi kredilerini görebilir
- **job_match_analyses**: Kullanıcılar sadece kendi analizlerini yönetebilir
- **optimized_cvs**: Kullanıcılar sadece kendi optimize CV'lerini görebilir
- **cover_letters**: Kullanıcılar sadece kendi ön yazılarını görebilir

### Authentication

- Supabase Auth kullanılıyor
- Email/şifre ile giriş
- Session yönetimi Supabase tarafından yapılıyor
- Middleware ile korumalı route'lar (gelecekte eklenecek)

### API Güvenliği

- Service Role Key sadece server-side kullanılıyor
- Client-side'da sadece Anon Key kullanılıyor
- RLS policies ile veri erişimi kontrol ediliyor
- Dosya yükleme validasyonu (tip ve boyut kontrolü)

---

## 🤖 AI Entegrasyonu

### OpenAI Kullanımı

#### Model: GPT-4o

#### Kullanım Senaryoları:

1. **PDF Metin Çıkarma**
   - OpenAI Assistants API kullanılıyor
   - File Search tool ile PDF içeriği çıkarılıyor
   - Geçici assistant ve thread oluşturuluyor
   - İşlem sonrası temizlik yapılıyor

2. **CV Analizi**
   - JSON formatında yanıt alınıyor
   - Temperature: 0.7
   - 8 kategoride skorlama
   - Türkçe yanıt

3. **Ön Yazı Oluşturma**
   - CV ve iş ilanına göre kişiselleştirilmiş içerik
   - Türkçe/İngilizce dil desteği
   - Temperature: 0.7
   - 250-400 kelime uzunluğunda

4. **İş Uyum Analizi**
   - JSON formatında detaylı analiz
   - 5 kriterde değerlendirme:
     - Teknik beceri eşleşmesi (30%)
     - Deneyim seviyesi uyumu (25%)
     - Eğitim gereksinimi (15%)
     - Soft skills (15%)
     - Anahtar kelime kullanımı (15%)
   - Temperature: 0.7

5. **CV Optimizasyonu**
   - Markdown formatında optimize CV
   - Anahtar kelime optimizasyonu
   - İş ilanına özel içerik
   - Temperature: 0.7

### Maliyet Optimizasyonu

- PDF metin çıkarma için Assistants API kullanılıyor (daha doğru sonuçlar)
- Her işlem sonrası geçici kaynaklar temizleniyor
- Rate limiting yok (gelecekte eklenecek)
- Caching yok (gelecekte eklenecek)

---

## 📊 Veri Akışı

### CV Analizi Akışı

```
1. Kullanıcı CV yükler (Frontend)
   ↓
2. Dosya Supabase Storage'a kaydedilir
   ↓
3. cv_analyses tablosuna kayıt oluşturulur (status: pending)
   ↓
4. /api/analyze-cv endpoint'i çağrılır
   ↓
5. Status: processing yapılır
   ↓
6. PDF'den metin çıkarılır (OpenAI Assistants)
   ↓
7. GPT-4o ile analiz yapılır
   ↓
8. analysis_results tablosuna kaydedilir
   ↓
9. Status: completed yapılır
   ↓
10. Kullanıcı kredisinden 1 kredi düşülür
   ↓
11. Frontend polling ile durumu kontrol eder
   ↓
12. Kullanıcıya sonuçlar gösterilir
```

### Ön Yazı Oluşturma Akışı

```
1. Kullanıcı formu doldurur (CV, iş ilanı, dil)
   ↓
2. /api/generate-cover-letter çağrılır
   ↓
3. CV analizinin tamamlandığı doğrulanır
   ↓
4. cover_letters tablosuna kayıt oluşturulur
   ↓
5. PDF'den metin çıkarılır
   ↓
6. GPT-4o ile ön yazı oluşturulur
   ↓
7. Sonuç kaydedilir ve kredi düşülür
   ↓
8. Kullanıcı ön yazıyı görüntüler
```

---

## 🐛 Bilinen Sorunlar ve Gelecek Planlar

### Bilinen Sorunlar

1. **Cover Letters Tablosu Eksik**
   - Migration dosyasında `cover_letters` tablosu tanımlı değil
   - API'de kullanılıyor ama veritabanında yok
   - **Çözüm**: Migration dosyası oluşturulmalı

2. **Middleware Eksik**
   - `middleware.ts.bak` dosyası var ama aktif değil
   - Protected route'lar için middleware yok
   - **Çözüm**: Middleware aktif edilmeli

3. **Error Handling**
   - Bazı API endpoint'lerinde hata yönetimi eksik
   - Kullanıcıya daha açıklayıcı hata mesajları verilmeli

4. **Rate Limiting Yok**
   - API endpoint'lerinde rate limiting yok
   - Kötüye kullanıma açık

5. **Dosya Temizleme**
   - Başarısız analizlerde dosyalar temizlenmiyor
   - Storage'da gereksiz dosyalar birikebilir

### Gelecek Planlar

#### Kısa Vadeli (1-2 Hafta)
- [ ] Cover letters tablosu migration'ı
- [ ] Middleware aktifleştirme
- [ ] Şifremi unuttum özelliği
- [ ] Email doğrulama
- [ ] Daha iyi error handling

#### Orta Vadeli (1 Ay)
- [ ] Kredi satın alma sistemi
- [ ] PDF rapor indirme
- [ ] Analiz karşılaştırma özelliği
- [ ] Rate limiting
- [ ] Dosya temizleme job'u
- [ ] Analytics entegrasyonu

#### Uzun Vadeli (3+ Ay)
- [ ] Çoklu dil desteği (i18n)
- [ ] Sektör bazlı analizler
- [ ] CV şablon önerileri
- [ ] LinkedIn entegrasyonu
- [ ] Premium abonelik modeli
- [ ] API rate limiting ve caching
- [ ] Background job queue (Bull/BullMQ)

---

## 📝 Önemli Notlar

### Environment Değişkenleri

Tüm environment değişkenleri `.env.local` dosyasında tutulmalı ve **asla** commit edilmemelidir.

### Supabase Storage

- Bucket adı: `cv-uploads`
- Public bucket olmalı (veya signed URL kullanılmalı)
- Dosya yolu formatı: `{user_id}/{timestamp}.pdf`

### Kredi Sistemi

- Yeni kullanıcıya otomatik 3 kredi veriliyor
- CV analizi: 1 kredi
- Ön yazı oluşturma: 1 kredi
- İş uyum analizi: 1 kredi
- CV optimizasyonu: 2 kredi

### OpenAI API

- Model: GPT-4o
- Temperature: 0.7 (tutarlı sonuçlar için)
- JSON mode kullanılıyor (analiz ve optimizasyon için)
- Assistants API PDF okuma için kullanılıyor

### TypeScript

- Strict mode aktif
- Database types otomatik generate edilmeli (Supabase CLI ile)
- Type safety için Zod validation kullanılıyor

---

## 🔗 Yararlı Linkler

- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [OpenAI API Dokümantasyonu](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

## 👥 Katkıda Bulunma

Projeye katkıda bulunmak için:

1. Feature branch oluşturun
2. Değişikliklerinizi yapın
3. Test edin
4. Pull request açın

---

## 📄 Lisans

ISC

---

**Son Güncelleme:** 2025-01-27  
**Hazırlayan:** AI CV Analizi Takımı  
**Versiyon:** 1.0

