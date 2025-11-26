"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CVUpload } from "@/components/cv-upload";
import { Sparkles, Upload, History, LogOut, User, CreditCard, Loader2, FileText, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
}

interface UserCredits {
  credits: number;
}

interface CVAnalysis {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  overall_score?: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [analyses, setAnalyses] = useState<CVAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient();

      // Get authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        window.location.href = "/auth/login";
        return;
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileData) {
        setUser({
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
        });
      }

      // Get user credits
      const { data: creditsData, error: creditsError } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", authUser.id)
        .single();

      if (creditsData) {
        setCredits(creditsData.credits);
      }

      // Get user's CV analyses
      const { data: analysesData } = await supabase
        .from("cv_analyses")
        .select(`
          id,
          file_name,
          status,
          created_at,
          analysis_results (
            overall_score
          )
        `)
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (analysesData) {
        setAnalyses(
          analysesData.map((a: any) => ({
            id: a.id,
            file_name: a.file_name,
            status: a.status,
            created_at: a.created_at,
            overall_score: a.analysis_results?.[0]?.overall_score,
          }))
        );
      }

      setIsLoading(false);
    };

    loadUserData();
  }, []);

  const refreshData = async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return;

    // Refresh credits
    const { data: creditsData } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", authUser.id)
      .single();

    if (creditsData) {
      setCredits(creditsData.credits);
    }

    // Refresh analyses
    const { data: analysesData } = await supabase
      .from("cv_analyses")
      .select(`
        id,
        file_name,
        status,
        created_at,
        analysis_results (
          overall_score
        )
      `)
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (analysesData) {
      setAnalyses(
        analysesData.map((a: any) => ({
          id: a.id,
          file_name: a.file_name,
          status: a.status,
          created_at: a.created_at,
          overall_score: a.analysis_results?.[0]?.overall_score,
        }))
      );
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                AI CV Analizi
              </span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full">
                <CreditCard className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {credits} Kredi
                </span>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-2 border-gray-200 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            Hoş Geldiniz, {user?.full_name || "Kullanıcı"}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            CV'nizi yükleyin ve yapay zeka destekli analiz alın
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Analiz</p>
                <p className="text-2xl font-bold text-gray-900">{analyses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kalan Kredi</p>
                <p className="text-2xl font-bold text-gray-900">{credits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hesap Durumu</p>
                <p className="text-xl font-bold text-gray-900">Aktif</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 mb-6">
                <Upload className="h-8 w-8 text-violet-600" />
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-4">
                CV'nizi Yükleyin
              </h2>

              <p className="text-gray-600">
                PDF formatında CV'nizi yükleyin ve yapay zeka destekli analiz alın.
                Her analiz 1 kredi kullanır.
              </p>
            </div>

            {user && (
              <CVUpload
                userId={user.id}
                credits={credits || 0}
                onUploadSuccess={refreshData}
              />
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <History className="h-6 w-6 text-violet-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Analiz Geçmişi
            </h2>
          </div>

          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">
                Henüz analiz geçmişiniz bulunmuyor
              </p>
              <p className="text-sm text-gray-500">
                İlk CV'nizi yükleyerek başlayın
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/dashboard/analysis/${analysis.id}`}
                  className="block bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-colors border-2 border-transparent hover:border-violet-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate mb-1">
                          {analysis.file_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(analysis.created_at).toLocaleDateString("tr-TR")}
                          </span>
                          {analysis.overall_score !== undefined && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              Skor: {analysis.overall_score}/100
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {analysis.status === "completed" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Tamamlandı
                        </span>
                      )}
                      {analysis.status === "processing" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          İşleniyor
                        </span>
                      )}
                      {analysis.status === "pending" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Bekliyor
                        </span>
                      )}
                      {analysis.status === "failed" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          Başarısız
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 AI CV Analizi. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
