"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Mail, ArrowLeft, Loader2, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CVAnalysis {
  id: string;
  file_name: string;
  status: string;
}

interface CoverLetter {
  id: string;
  job_title: string;
  company_name: string | null;
  language: string;
  status: string;
  created_at: string;
}

export default function CoverLetterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [cvAnalyses, setCvAnalyses] = useState<CVAnalysis[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [selectedCV, setSelectedCV] = useState("");
  const [language, setLanguage] = useState("tr");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

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

      // Get completed CV analyses
      const { data: analysesData } = await supabase
        .from("cv_analyses")
        .select("id, file_name, status")
        .eq("user_id", authUser.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (analysesData) {
        setCvAnalyses(analysesData);
      }

      // Get cover letters
      const { data: lettersData } = await supabase
        .from("cover_letters")
        .select("id, job_title, company_name, language, status, created_at")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (lettersData) {
        setCoverLetters(lettersData);
      }

      setIsLoading(false);
    };

    loadData();
  }, [router]);

  const handleGenerate = async () => {
    if (!selectedCV || !jobTitle || !jobDescription) {
      toast.error("Lütfen tüm gerekli alanları doldurun");
      return;
    }

    if (credits === null || credits < 1) {
      toast.error("Yetersiz kredi. Lütfen kredi satın alın.");
      return;
    }

    if (jobDescription.length > 5000) {
      toast.error("İş ilanı açıklaması çok uzun (max 5000 karakter)");
      return;
    }

    setIsGenerating(true);

    const generatingToast = toast.loading("Ön yazı oluşturuluyor...", {
      description: "Bu işlem 20-30 saniye sürebilir.",
    });

    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvAnalysisId: selectedCV,
          jobTitle,
          companyName: companyName || null,
          jobDescription,
          language,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ön yazı oluşturulamadı");
      }

      const { coverLetterId } = await response.json();

      toast.success("Ön Yazı Oluşturuldu!", {
        id: generatingToast,
        description: "Ön yazınız başarıyla oluşturuldu.",
        duration: 3000,
      });

      // Reset form
      setSelectedCV("");
      setJobTitle("");
      setCompanyName("");
      setJobDescription("");

      // Redirect to cover letter view
      router.push(`/dashboard/cover-letter/${coverLetterId}`);
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error("Oluşturma Başarısız", {
        id: generatingToast,
        description: error.message || "Bir hata oluştu",
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
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
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="h-10 w-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                AI CV Analizi
              </span>
            </Link>

            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-full">
              <span className="text-sm font-semibold text-gray-700">
                {credits} Kredi
              </span>
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

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            AI Ön Yazı Oluşturucu
          </h1>
          <p className="text-lg text-gray-600">
            CV'nizi ve iş ilanını kullanarak kişiselleştirilmiş ön yazı oluşturun
          </p>
        </div>

        {/* Generator Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 mb-6">
                <Mail className="h-8 w-8 text-violet-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">
                Yeni Ön Yazı Oluştur
              </h2>
              <p className="text-gray-600">
                Her ön yazı 1 kredi kullanır
              </p>
            </div>

            <div className="space-y-6">
              {/* CV Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  CV Seçin *
                </label>
                <Select
                  value={selectedCV}
                  onChange={(e) => setSelectedCV(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="">CV seçiniz</option>
                  {cvAnalyses.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.file_name}
                    </option>
                  ))}
                </Select>
                {cvAnalyses.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Henüz tamamlanmış CV analiziniz yok.{" "}
                    <Link href="/dashboard" className="text-violet-600 hover:underline">
                      CV yükleyin
                    </Link>
                  </p>
                )}
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Dil *
                </label>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </Select>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  İş Pozisyonu *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="ör. Senior Frontend Developer"
                  disabled={isGenerating}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Şirket Adı (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ör. Acme Corp"
                  disabled={isGenerating}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2"
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  İş İlanı Açıklaması *
                </label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="İş ilanının tamamını veya önemli bölümlerini buraya yapıştırın..."
                  disabled={isGenerating}
                  rows={10}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {jobDescription.length}/5000 karakter
                </p>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedCV || !jobTitle || !jobDescription || credits === null || credits < 1}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/30 h-12"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Ön Yazı Oluştur (1 Kredi)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Cover Letters */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Son Ön Yazılarım
          </h2>

          {coverLetters.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Henüz ön yazınız bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coverLetters.map((letter) => (
                <Link
                  key={letter.id}
                  href={`/dashboard/cover-letter/${letter.id}`}
                  className="block bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-colors border-2 border-transparent hover:border-violet-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          {letter.job_title}
                          {letter.company_name && ` - ${letter.company_name}`}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(letter.created_at).toLocaleDateString("tr-TR")}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                            {letter.language === "tr" ? "Türkçe" : "English"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {letter.status === "completed" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Hazır
                        </span>
                      )}
                      {letter.status === "processing" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          İşleniyor
                        </span>
                      )}
                      {letter.status === "failed" && (
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
    </div>
  );
}
