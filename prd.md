# AI CV Analizi Web Sitesi - Product Requirements Document

## 1. Proje Özeti

### 1.1 Ürün Vizyonu
Kullanıcıların CV'lerini yükleyip yapay zeka destekli analiz alabileceği, profesyonel geri bildirimler alacağı ve CV'lerini geliştirebileceği modern bir web platformu.

### 1.2 Hedef Kitle
- İş arayanlar
- Kariyerini geliştirmek isteyen profesyoneller
- Üniversite öğrencileri ve yeni mezunlar
- Kariyer danışmanları

### 1.3 Temel Değer Önerisi
- Anında AI destekli CV analizi
- Detaylı iyileştirme önerileri
- Sektör standartlarına göre değerlendirme
- Kullanıcı dostu ve şık arayüz

## 2. Teknik Mimari

### 2.1 Teknoloji Stack'i

#### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context / Zustand
- **Form Handling**: React Hook Form + Zod
- **File Upload**: react-dropzone
- **Icons**: Lucide React

#### Backend
- **Framework**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (CV dosyaları için)
- **AI**: OpenAI GPT-4 API

#### DevOps
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **Version Control**: Git

### 2.2 Veritabanı Şeması

```sql
-- Kullanıcılar (Supabase Auth ile entegre)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- CV Analizleri
cv_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Analiz Sonuçları
analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_analysis_id UUID REFERENCES cv_analyses(id) ON DELETE CASCADE,
  overall_score INTEGER, -- 0-100
  summary TEXT,
  strengths JSONB, -- ["güçlü yön 1", "güçlü yön 2"]
  weaknesses JSONB, -- ["zayıf yön 1", "zayıf yön 2"]
  improvements JSONB, -- [{"kategori": "...", "öneri": "..."}]
  section_scores JSONB, -- {"iletişim": 90, "deneyim": 75, ...}
  keywords JSONB, -- ["Python", "React", ...]
  ai_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Kullanıcı Kredileri (opsiyonel - gelecekte ücretlendirme için)
user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 3,
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## 3. Özellikler ve Fonksiyonellik

### 3.1 MVP (Minimum Viable Product) Özellikleri

#### 3.1.1 Kullanıcı Yönetimi
- [ ] Email/şifre ile kayıt olma
- [ ] Giriş yapma / Çıkış yapma
- [ ] Şifremi unuttum
- [ ] Profil sayfası

#### 3.1.2 CV Yükleme
- [ ] Drag & drop CV yükleme
- [ ] Desteklenen formatlar: PDF, DOCX
- [ ] Maksimum dosya boyutu: 10MB
- [ ] Yükleme progress bar'ı
- [ ] Dosya doğrulama

#### 3.1.3 AI Analiz
- [ ] OpenAI API ile CV içeriği çıkarma
- [ ] Şu kriterlere göre analiz:
  - İletişim bilgileri eksiksizliği
  - Profesyonel özet kalitesi
  - İş deneyimi detayları
  - Eğitim bilgileri
  - Beceriler ve yetkinlikler
  - Formatı ve düzen
  - Anahtar kelime optimizasyonu
  - ATS (Applicant Tracking System) uyumluluğu

#### 3.1.4 Sonuç Gösterimi
- [ ] Genel skor (0-100)
- [ ] Bölüm bazında skorlar (radar chart)
- [ ] Güçlü yönler listesi
- [ ] Geliştirilmesi gereken alanlar
- [ ] Detaylı iyileştirme önerileri
- [ ] Bulunan anahtar kelimeler
- [ ] AI'ın genel değerlendirmesi

#### 3.1.5 Geçmiş ve Karşılaştırma
- [ ] Geçmiş analizleri görüntüleme
- [ ] Analizleri karşılaştırma
- [ ] İlerleme takibi

### 3.2 Gelecek Özellikler (V2+)
- Birden fazla dilde destek (İngilizce, Türkçe)
- Sektör bazlı özelleştirilmiş analizler
- CV şablon önerileri
- LinkedIn profil analizi
- Ön yazı (cover letter) analizi
- Premium abonelik modeli
- PDF rapor indirme
- Sosyal medya paylaşımı

## 4. Kullanıcı Akışları

### 4.1 Yeni Kullanıcı Akışı
1. Landing page'e geliş
2. "Ücretsiz Dene" butonuna tıklama
3. Kayıt olma (email + şifre)
4. Email doğrulama
5. Dashboard'a yönlendirme
6. CV yükleme
7. Analiz sonuçlarını görme

### 4.2 Mevcut Kullanıcı Akışı
1. Giriş yapma
2. Dashboard
3. "Yeni Analiz" veya "Geçmiş Analizler"
4. CV yükleme / Eski analizi görme
5. Sonuçları inceleme

## 5. UI/UX Tasarım Gereksinimleri

### 5.1 Tasarım Prensibleri
- **Minimalist ve modern**: Temiz, net, profesyonel görünüm
- **Kullanıcı dostu**: Sezgisel navigasyon, açık talimatlar
- **Responsive**: Mobil, tablet ve desktop uyumlu
- **Hızlı**: Optimized loading, skeleton screens
- **Erişilebilir**: WCAG 2.1 standartlarına uygun

### 5.2 Renk Paleti
- **Primary**: Mavi tonları (profesyonellik, güven)
- **Secondary**: Yeşil tonları (başarı, gelişim)
- **Accent**: Turuncu/mor (vurgu için)
- **Neutral**: Gri tonları
- **Backgrounds**: Beyaz, açık gri gradyanları

### 5.3 Tipografi
- **Heading**: Inter, Poppins veya Satoshi (modern sans-serif)
- **Body**: Inter veya System UI
- **Monospace**: JetBrains Mono (kod/data için)

### 5.4 Temel Sayfalar

#### Landing Page
- Hero section (başlık, alt başlık, CTA)
- Nasıl çalışır? (3 adım)
- Özellikler showcase
- Örnek sonuç gösterimi
- Testimonials (gelecekte)
- Footer (iletişim, sosyal medya, yasal)

#### Dashboard
- Sidebar navigasyon
- Hızlı istatistikler (toplam analiz, ortalama skor)
- "Yeni Analiz Başlat" CTA
- Son analizler listesi
- Kredi durumu (gelecekte)

#### Upload Page
- Drag & drop zone
- Dosya seçici
- Yükleme progress
- Desteklenen formatlar bilgisi
- Önceki CV'lerden seç (opsiyonel)

#### Results Page
- Genel skor (büyük, göze çarpan)
- Radar/circular chart (bölüm skorları)
- Tabbed interface:
  - Genel Bakış
  - Güçlü Yönler
  - İyileştirme Önerileri
  - Detaylı Analiz
- "Yeni Analiz" ve "PDF İndir" butonları

#### History Page
- Tablo/grid görünümü
- Filtreleme ve sıralama
- Arama
- Karşılaştırma seçeneği

## 6. OpenAI API Entegrasyonu

### 6.1 Kullanım Senaryosu
- **Model**: GPT-4 Turbo veya GPT-4
- **Max Tokens**: 4000-8000
- **Temperature**: 0.3-0.5 (tutarlı sonuçlar için)

### 6.2 Prompt Yapısı
```
Sen bir profesyonel CV danışmanısın. Aşağıdaki CV'yi analiz et ve şu kriterlere göre değerlendir:

CV İçeriği:
{extracted_text}

Lütfen şu formatta yanıt ver:
1. Genel Skor (0-100)
2. Bölüm Skorları:
   - İletişim Bilgileri (0-100)
   - Profesyonel Özet (0-100)
   - İş Deneyimi (0-100)
   - Eğitim (0-100)
   - Beceriler (0-100)
   - Format ve Düzen (0-100)
3. Güçlü Yönler (3-5 madde)
4. Geliştirilmesi Gerekenler (3-5 madde)
5. Detaylı İyileştirme Önerileri (kategori bazında)
6. Bulunan Anahtar Kelimeler
7. Genel Değerlendirme (2-3 paragraf)

JSON formatında yanıt ver.
```

### 6.3 Maliyet Optimizasyonu
- PDF/DOCX'ten text extraction için local library kullan (pdf-parse, mammoth)
- Sadece text içeriği OpenAI'ya gönder
- Caching stratejisi
- Rate limiting

## 7. Güvenlik ve Gizlilik

### 7.1 Güvenlik Önlemleri
- [ ] HTTPS zorunlu
- [ ] Supabase Row Level Security (RLS) policies
- [ ] API rate limiting
- [ ] File upload validation ve sanitization
- [ ] SQL injection koruması (Supabase otomatik)
- [ ] XSS koruması
- [ ] CORS yapılandırması

### 7.2 Gizlilik
- [ ] GDPR uyumluluğu
- [ ] KVKK uyumluluğu
- [ ] Gizlilik politikası sayfası
- [ ] Kullanım şartları
- [ ] CV'lerin şifreli depolanması
- [ ] Kullanıcı verilerini silme hakkı
- [ ] OpenAI Data Privacy Policy uyumluluğu

## 8. Performans Gereksinimleri

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3s
- **CV Analiz Süresi**: < 30s
- **Lighthouse Score**: > 90

## 9. Başarı Metrikleri (KPIs)

- Kayıt olan kullanıcı sayısı
- Yapılan toplam analiz sayısı
- Kullanıcı başına ortalama analiz sayısı
- Kullanıcı memnuniyeti (feedback)
- Dönüşüm oranı (visitor → user)
- Retention rate (7 gün, 30 gün)

## 10. Geliştirme Aşamaları

### Faz 1: Altyapı ve Temel Kurulum (Hafta 1)
- [ ] Next.js projesi kurulumu
- [ ] Tailwind CSS ve shadcn/ui entegrasyonu
- [ ] Supabase projesi oluşturma
- [ ] Veritabanı şeması oluşturma
- [ ] Authentication kurulumu
- [ ] Klasör yapısı ve routing

### Faz 2: Core Features (Hafta 2)
- [ ] Landing page tasarımı ve implementasyonu
- [ ] Kullanıcı kayıt/giriş sayfaları
- [ ] Dashboard layout
- [ ] CV upload functionality
- [ ] File storage (Supabase Storage)

### Faz 3: AI Entegrasyonu (Hafta 3)
- [ ] OpenAI API entegrasyonu
- [ ] PDF/DOCX text extraction
- [ ] Analiz algoritması
- [ ] Background job handling
- [ ] Error handling

### Faz 4: Results & History (Hafta 4)
- [ ] Results page UI/UX
- [ ] Charts ve visualizations
- [ ] History page
- [ ] Karşılaştırma özelliği
- [ ] Responsive optimizasyonlar

### Faz 5: Polish & Launch (Hafta 5)
- [ ] Testing (unit, integration, e2e)
- [ ] Performance optimizasyonları
- [ ] SEO optimizasyonları
- [ ] Analytics entegrasyonu
- [ ] Documentation
- [ ] Production deployment

## 11. Risk Analizi

### 11.1 Teknik Riskler
- **OpenAI API maliyetleri**: Rate limiting, caching ile çözüm
- **PDF parsing zorlukları**: Fallback stratejileri
- **Büyük dosyalar**: Dosya boyutu limiti, chunking

### 11.2 İş Riskleri
- **Kullanıcı kabulü**: Beta testing, feedback toplama
- **Rekabet**: Unique value proposition vurgulama
- **Sürdürülebilirlik**: Freemium model, premium features

## 12. Kaynaklar ve Referanslar

### Benzer Ürünler
- Resume Worded
- Jobscan
- Rezi.ai
- Enhancv

### Teknik Dokümantasyon
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

**Doküman Versiyonu**: 1.0
**Son Güncelleme**: 2025-11-26
**Hazırlayan**: AI CV Analizi Takımı
