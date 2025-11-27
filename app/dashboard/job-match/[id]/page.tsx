"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Target,
  FileText,
  Zap
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface JobMatchData {
  id: string;
  job_title: string;
  company_name: string | null;
  job_description: string;
  match_score: number | null;
  missing_skills: string[];
  existing_strengths: string[];
  recommendations: string[];
  keyword_analysis: {
    required_keywords: string[];
    cv_keywords: string[];
    matched: string[];
    missing: string[];
  };
  detailed_feedback: string;
  status: string;
  cv_analyses: {
    file_name: string;
  };
  optimized_cvs?: Array<{ id: string }>;
}

export default function JobMatchResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [jobMatch, setJobMatch] = useState<JobMatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // Get user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        router.push("/auth/login");
        return;
      }

      setUser(authUser);

      // Get credits
      const { data: creditsData } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", authUser.id)
        .single();

      if (creditsData) {
        setCredits(creditsData.credits);
      }

      // Polling for job match results
      let attempts = 0;
      const maxAttempts = 60; // 3 minutes max (60 * 3 seconds)

      const checkStatus = async () => {
        const response = await fetch(`/api/job-match/${id}`);

        if (response.ok) {
          const data = await response.json();

          if (data.status === "completed") {
            setJobMatch(data);
            setIsLoading(false);
            return true;
          } else if (data.status === "failed") {
            setIsLoading(false);
            return true;
          }
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setIsLoading(false);
          return true;
        }

        return false;
      };

      // Initial check
      const done = await checkStatus();
      if (done) return;

      // Poll every 3 seconds
      const interval = setInterval(async () => {
        const done = await checkStatus();
        if (done) {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    };

    loadData();
  }, [id, router]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 90) return "Mükemmel Uyum";
    if (score >= 80) return "Çok İyi Uyum";
    if (score >= 70) return "İyi Uyum";
    if (score >= 60) return "Orta Seviye Uyum";
    if (score >= 50) return "Zayıf Uyum";
    return "Çok Zayıf Uyum";
  };

  const handleOptimizeCV = async () => {
    if (credits === null || credits < 2) {
      toast.error("Yetersiz kredi", {
        description: "CV optimizasyonu için 2 kredi gereklidir.",
      });
      return;
    }

    setIsOptimizing(true);

    const optimizingToast = toast.loading("CV optimize ediliyor...", {
      description: "Bu işlem 30-40 saniye sürebilir.",
    });

    try {
      const response = await fetch("/api/optimize-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobMatchAnalysisId: id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "CV optimizasyonu başarısız oldu");
      }

      const { optimizedCvId } = await response.json();

      toast.success("CV Optimize Edildi!", {
        id: optimizingToast,
        description: "Optimize edilmiş CV'niz hazır.",
        duration: 3000,
      });

      // Redirect to optimized CV page
      router.push(`/dashboard/optimized-cv/${optimizedCvId}`);
    } catch (error: any) {
      console.error("Optimization error:", error);
      toast.error("Optimizasyon Başarısız", {
        id: optimizingToast,
        description: error.message || "Bir hata oluştu",
        duration: 5000,
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-600 mb-4" />
        <p className="text-gray-600">Analiz sonuçları yükleniyor...</p>
      </div>
    );
  }

  if (!jobMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        <p className="text-gray-600 mb-4">Analiz sonuçları bulunamadı</p>
        <Link href="/dashboard/job-match">
          <Button>Geri Dön</Button>
        </Link>
      </div>
    );
  }

  if (jobMatch.status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        <p className="text-gray-600 mb-4">Analiz başarısız oldu</p>
        <Link href="/dashboard/job-match">
          <Button>Yeni Analiz Yap</Button>
        </Link>
      </div>
    );
  }

  const matchScore = jobMatch.match_score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="h-10 w-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                AI CV Analizi
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link
          href="/dashboard/job-match"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          İş Uyum Analizlerine Dön
        </Link>

        {/* Hero - Match Score Card */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl shadow-2xl border-2 border-cyan-200 p-8 md:p-12 mb-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur rounded-full mb-6">
              <Target className="h-5 w-5 text-cyan-600" />
              <span className="text-sm font-semibold text-gray-700">İş Uyum Analizi</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              {jobMatch.job_title}
            </h1>
            {jobMatch.company_name && (
              <p className="text-xl text-gray-600 mb-8">{jobMatch.company_name}</p>
            )}

            <div className="relative inline-block mb-6">
              <div className="w-48 h-48 rounded-full bg-white shadow-2xl flex items-center justify-center relative">
                <div className="text-center">
                  <div className={`text-6xl font-black mb-2 ${getMatchScoreColor(matchScore)}`}>
                    {matchScore}%
                  </div>
                  <p className="text-sm font-semibold text-gray-600">
                    {getMatchScoreLabel(matchScore)}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600">
              <span className="font-semibold">CV:</span> {jobMatch.cv_analyses?.file_name}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {jobMatch.existing_strengths?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Güçlü Yön</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {jobMatch.missing_skills?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Eksik Beceri</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((jobMatch.keyword_analysis?.matched?.length / jobMatch.keyword_analysis?.required_keywords?.length) * 100) || 0}%
                </p>
                <p className="text-sm text-gray-600">Kelime Uyumu</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {jobMatch.recommendations?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Öneri</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Existing Strengths */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Mevcut Güçlü Yönler</h2>
            </div>
            <div className="space-y-3">
              {jobMatch.existing_strengths?.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Eksik Beceriler</h2>
            </div>
            <div className="space-y-3">
              {jobMatch.missing_skills?.map((skill, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl shadow-xl border-2 border-violet-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-100 rounded-xl">
              <Lightbulb className="h-6 w-6 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Öneriler</h2>
          </div>
          <div className="space-y-3">
            {jobMatch.recommendations?.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                <Lightbulb className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed AI Feedback */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl shadow-2xl p-8 md:p-12 mb-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-8 w-8" />
            <h2 className="text-3xl font-black">Detaylı AI Değerlendirmesi</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-line">
              {jobMatch.detailed_feedback}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {jobMatch.optimized_cvs && jobMatch.optimized_cvs.length > 0 ? (
            <Link href={`/dashboard/optimized-cv/${jobMatch.optimized_cvs[0].id}`}>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-12 text-lg px-8">
                <Zap className="mr-2 h-5 w-5" />
                Optimize Edilmiş CV'yi Gör
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleOptimizeCV}
              disabled={isOptimizing || credits === null || credits < 2}
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-12 text-lg px-8"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Optimize Ediliyor...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Bu İş İçin CV'yi Optimize Et (2 Kredi)
                </>
              )}
            </Button>
          )}
          <Link href="/dashboard/job-match">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-12 text-lg px-8">
              <Target className="mr-2 h-5 w-5" />
              Başka İş İlanı Dene
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
