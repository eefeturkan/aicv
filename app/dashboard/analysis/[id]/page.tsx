"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Target,
  Award,
  FileText,
  Loader2,
  Download,
  Share2,
} from "lucide-react";
import Link from "next/link";

interface AnalysisResult {
  id: string;
  overall_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  section_scores: {
    contact_info: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    formatting: number;
  };
  keywords: string[];
  ai_feedback: string;
}

interface CVAnalysis {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalysis = async () => {
      const supabase = createClient();

      // Get analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from("cv_analyses")
        .select("*")
        .eq("id", params.id)
        .single();

      if (analysisError || !analysisData) {
        router.push("/dashboard");
        return;
      }

      setAnalysis(analysisData);

      // Get results
      const { data: resultData, error: resultError } = await supabase
        .from("analysis_results")
        .select("*")
        .eq("cv_analysis_id", params.id)
        .single();

      if (resultData) {
        setResult(resultData);
      }

      setIsLoading(false);
    };

    if (params.id) {
      loadAnalysis();
    }
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreRing = (score: number) => {
    if (score >= 80) return "stroke-green-600";
    if (score >= 60) return "stroke-yellow-600";
    return "stroke-red-600";
  };

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

            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-2">
                <Share2 className="h-4 w-4 mr-2" />
                Paylaş
              </Button>
              <Button variant="outline" className="border-2">
                <Download className="h-4 w-4 mr-2" />
                PDF İndir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          Dashboard'a Dön
        </Link>

        {/* File info */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            {analysis.file_name}
          </h1>
          <p className="text-gray-600">
            Analiz Tarihi: {new Date(analysis.created_at).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {analysis.status === "processing" || analysis.status === "pending" ? (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-violet-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              CV'niz Analiz Ediliyor
            </h2>
            <p className="text-gray-600">
              Yapay zeka modelimiz CV'nizi inceliyor. Bu işlem birkaç dakika sürebilir.
            </p>
          </div>
        ) : analysis.status === "failed" ? (
          <div className="bg-white rounded-3xl shadow-2xl border border-red-200 p-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Analiz Başarısız Oldu
            </h2>
            <p className="text-gray-600 mb-6">
              CV analizinde bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                Dashboard'a Dön
              </Button>
            </Link>
          </div>
        ) : result ? (
          <div className="space-y-8">
            {/* Overall Score */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-4">
                    Genel Değerlendirme
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    {result.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.slice(0, 8).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative">
                    <svg className="transform -rotate-90 w-48 h-48">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(result.overall_score / 100) * 553} 553`}
                        className={getScoreRing(result.overall_score)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-black text-gray-900">
                          {result.overall_score}
                        </div>
                        <div className="text-sm text-gray-600 font-semibold">
                          / 100
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Scores */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Bölüm Bazlı Değerlendirme
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(result.section_scores).map(([key, score]) => {
                  const labels: Record<string, string> = {
                    contact_info: "İletişim Bilgileri",
                    summary: "Özet",
                    experience: "Deneyim",
                    education: "Eğitim",
                    skills: "Yetenekler",
                    formatting: "Format ve Tasarım",
                  };

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">
                          {labels[key]}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(score)}`}>
                          {score}/100
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            score >= 80
                              ? "bg-green-500"
                              : score >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Güçlü Yönler
                </h2>
              </div>
              <ul className="space-y-3">
                {result.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Geliştirilmesi Gereken Alanlar
                </h2>
              </div>
              <ul className="space-y-3">
                {result.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-violet-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  İyileştirme Önerileri
                </h2>
              </div>
              <ul className="space-y-3">
                {result.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Feedback */}
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl shadow-2xl border border-violet-200 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  AI Danışmanı Görüşü
                </h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {result.ai_feedback}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
