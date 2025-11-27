"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Copy, Check, Loader2, Mail, Calendar, Globe } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CoverLetter {
  id: string;
  job_title: string;
  company_name: string | null;
  job_description: string;
  language: string;
  generated_letter: string;
  status: string;
  created_at: string;
  cv_analyses: {
    file_name: string;
  };
}

export default function CoverLetterViewPage() {
  const params = useParams();
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const loadCoverLetter = async () => {
      const supabase = createClient();

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/auth/login");
        return;
      }

      // Fetch cover letter directly from Supabase
      const { data: coverLetterData, error: fetchError } = await supabase
        .from("cover_letters")
        .select(`
          *,
          cv_analyses (
            file_name
          )
        `)
        .eq("id", params.id)
        .single();

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        toast.error("Ön yazı bulunamadı");
        router.push("/dashboard/cover-letter");
        return;
      }

      if (!coverLetterData) {
        router.push("/dashboard/cover-letter");
        return;
      }

      setCoverLetter(coverLetterData);
      setIsLoading(false);
    };

    if (params.id) {
      loadCoverLetter();
    }
  }, [params.id, router]);

  const handleCopy = async () => {
    if (!coverLetter?.generated_letter) return;

    try {
      await navigator.clipboard.writeText(coverLetter.generated_letter);
      setIsCopied(true);
      toast.success("Ön yazı kopyalandı!", {
        description: "Ön yazınız panoya kopyalandı.",
      });

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Kopyalama başarısız", {
        description: "Lütfen tekrar deneyin.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!coverLetter) {
    return null;
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

            <Button
              onClick={handleCopy}
              variant="outline"
              className="border-2"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Kopyala
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link
          href="/dashboard/cover-letter"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          Ön Yazı Oluşturucu'ya Dön
        </Link>

        {/* Metadata */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            {coverLetter.job_title}
          </h1>
          {coverLetter.company_name && (
            <p className="text-xl text-gray-600 mb-4">{coverLetter.company_name}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(coverLetter.created_at).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {coverLetter.language === "tr" ? "Türkçe" : "English"}
            </span>
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              CV: {coverLetter.cv_analyses.file_name}
            </span>
          </div>
        </div>

        {/* Cover Letter Content */}
        {coverLetter.status === "processing" || coverLetter.status === "pending" ? (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-violet-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ön Yazınız Oluşturuluyor
            </h2>
            <p className="text-gray-600">
              Yapay zeka modelimiz sizin için özel bir ön yazı hazırlıyor. Bu işlem birkaç dakika sürebilir.
            </p>
          </div>
        ) : coverLetter.status === "failed" ? (
          <div className="bg-white rounded-3xl shadow-2xl border border-red-200 p-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
              <Mail className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Oluşturma Başarısız Oldu
            </h2>
            <p className="text-gray-600 mb-6">
              Ön yazı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            <Link href="/dashboard/cover-letter">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                Yeni Ön Yazı Oluştur
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-serif">
                {coverLetter.generated_letter}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-8 border-t border-gray-200 flex gap-3">
              <Button
                onClick={handleCopy}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {isCopied ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Panoya Kopyala
                  </>
                )}
              </Button>
              <Link href="/dashboard/cover-letter" className="flex-1">
                <Button variant="outline" className="w-full border-2">
                  <Mail className="mr-2 h-5 w-5" />
                  Yeni Ön Yazı Oluştur
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Job Description Reference */}
        {coverLetter.status === "completed" && (
          <div className="mt-8 bg-gray-50 rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">İş İlanı Referansı</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {coverLetter.job_description.substring(0, 300)}
              {coverLetter.job_description.length > 300 && "..."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
