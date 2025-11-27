-- İş Uyum Analizi (Job Match Analyzer) Migration
-- Bu migration iş ilanları ile CV karşılaştırma özelliğini ekler

-- İş uyum analizleri tablosu
CREATE TABLE IF NOT EXISTS public.job_match_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cv_analysis_id UUID NOT NULL REFERENCES public.cv_analyses(id) ON DELETE CASCADE,

  -- İş ilanı bilgileri
  job_title TEXT NOT NULL,
  company_name TEXT,
  job_description TEXT NOT NULL CHECK (char_length(job_description) <= 10000),
  job_source_url TEXT, -- Gelecekte link özelliği için

  -- Analiz durumu
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Analiz sonuçları (JSONB ile esnek yapı)
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  missing_skills JSONB DEFAULT '[]'::jsonb,
  existing_strengths JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  keyword_analysis JSONB DEFAULT '{}'::jsonb,
  detailed_feedback TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimize edilmiş CV'ler tablosu
CREATE TABLE IF NOT EXISTS public.optimized_cvs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_match_analysis_id UUID NOT NULL REFERENCES public.job_match_analyses(id) ON DELETE CASCADE,

  optimized_content TEXT NOT NULL,
  optimization_notes JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_job_match_analyses_user_id
  ON public.job_match_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_job_match_analyses_cv_analysis_id
  ON public.job_match_analyses(cv_analysis_id);
CREATE INDEX IF NOT EXISTS idx_job_match_analyses_status
  ON public.job_match_analyses(status);
CREATE INDEX IF NOT EXISTS idx_job_match_analyses_created_at
  ON public.job_match_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_optimized_cvs_user_id
  ON public.optimized_cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_optimized_cvs_job_match_analysis_id
  ON public.optimized_cvs(job_match_analysis_id);

-- RLS Politikalarını Aktifleştir
ALTER TABLE public.job_match_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimized_cvs ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları: job_match_analyses
CREATE POLICY "Users can view their own job match analyses"
  ON public.job_match_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job match analyses"
  ON public.job_match_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job_match_analyses"
  ON public.job_match_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job match analyses"
  ON public.job_match_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Politikaları: optimized_cvs
CREATE POLICY "Users can view their own optimized CVs"
  ON public.optimized_cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own optimized CVs"
  ON public.optimized_cvs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Timestamp trigger'ları
CREATE TRIGGER set_updated_at_job_match_analyses
  BEFORE UPDATE ON public.job_match_analyses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_optimized_cvs
  BEFORE UPDATE ON public.optimized_cvs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Eksik decrement_credits fonksiyonunu ekleme
-- Bu fonksiyon mevcut API'lerde kullanılıyor ama tanımlı değildi
CREATE OR REPLACE FUNCTION public.decrement_credits(
  user_uuid UUID,
  credit_amount INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  -- Atomik olarak kredi azalt
  UPDATE public.user_credits
  SET credits = GREATEST(credits - credit_amount, 0)
  WHERE user_id = user_uuid;

  -- Eğer güncelleme yapılamadıysa hata fırlat
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User credits record not found for user %', user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
