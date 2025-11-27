"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  Download,
  Copy,
  CheckCircle2,
  Zap,
  FileText,
  Lightbulb
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OptimizedCvData {
  id: string;
  optimized_content: string;
  optimization_notes: string[];
  status: string;
  created_at: string;
  job_match_analyses: {
    job_title: string;
    company_name: string | null;
    match_score: number;
    cv_analyses: {
      file_name: string;
    };
  };
}

export default function OptimizedCvPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [optimizedCv, setOptimizedCv] = useState<OptimizedCvData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // Get user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        router.push("/auth/login");
        return;
      }

      // Polling for optimized CV
      let attempts = 0;
      const maxAttempts = 60; // 3 minutes max

      const checkStatus = async () => {
        const response = await fetch(`/api/optimize-cv/${id}`);

        if (response.ok) {
          const data = await response.json();

          if (data.status === "completed") {
            setOptimizedCv(data);
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

      const done = await checkStatus();
      if (done) return;

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

  const handleCopy = async () => {
    if (!optimizedCv) return;

    try {
      await navigator.clipboard.writeText(optimizedCv.optimized_content);
      setIsCopied(true);
      toast.success("Kopyalandı!", {
        description: "CV içeriği panoya kopyalandı.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Kopyalama başarısız");
    }
  };

  const handleDownload = () => {
    if (!optimizedCv) return;

    const blob = new Blob([optimizedCv.optimized_content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized-cv-${optimizedCv.job_match_analyses.job_title.replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("İndiriliyor", {
      description: "CV dosyanız indiriliyor.",
    });
  };

  const handleDownloadPDF = async () => {
    if (!optimizedCv) return;

    setIsGeneratingPDF(true);
    const pdfToast = toast.loading("PDF oluşturuluyor...", {
      description: "Bu birkaç saniye sürebilir.",
    });

    try {
      const cvElement = document.getElementById("cv-pdf-template");
      if (!cvElement) throw new Error("CV template bulunamadı");

      // Capture the element as canvas with improved settings
      const canvas = await html2canvas(cvElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        removeContainer: false,
        allowTaint: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
        windowHeight: cvElement.scrollHeight,
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Convert pixels to mm (96 DPI = 3.779527559 pixels per mm)
      const pixelsPerMm = 3.779527559;
      const imgWidthMm = canvas.width / pixelsPerMm;
      const imgHeightMm = canvas.height / pixelsPerMm;

      // Calculate scaling to fit page width
      const widthRatio = pdfWidth / imgWidthMm;
      const scaledHeight = imgHeightMm * widthRatio;

      // Add image to PDF
      let heightLeft = scaledHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
      }

      // Download PDF
      const fileName = `optimized-cv-${optimizedCv.job_match_analyses.job_title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      pdf.save(fileName);

      toast.success("PDF İndirildi!", {
        id: pdfToast,
        description: "CV'niz PDF olarak indirildi.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("PDF Oluşturulamadı", {
        id: pdfToast,
        description: error instanceof Error ? error.message : "Bir hata oluştu, lütfen tekrar deneyin.",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-violet-600 mb-4" />
        <p className="text-gray-600">Optimize edilmiş CV yükleniyor...</p>
      </div>
    );
  }

  if (!optimizedCv || optimizedCv.status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col items-center justify-center">
        <FileText className="h-12 w-12 text-red-600 mb-4" />
        <p className="text-gray-600 mb-4">CV optimizasyonu başarısız oldu</p>
        <Link href="/dashboard/job-match">
          <Button>Geri Dön</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
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

        {/* Hero */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl shadow-2xl border-2 border-violet-200 p-8 md:p-12 mb-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur rounded-full mb-6">
              <Zap className="h-5 w-5 text-violet-600" />
              <span className="text-sm font-semibold text-gray-700">Optimize Edilmiş CV</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              {optimizedCv.job_match_analyses.job_title}
            </h1>
            {optimizedCv.job_match_analyses.company_name && (
              <p className="text-xl text-gray-600 mb-4">{optimizedCv.job_match_analyses.company_name}</p>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800">
                Orijinal Uyum Skoru: {optimizedCv.job_match_analyses.match_score}%
              </span>
            </div>

            <p className="text-gray-600">
              <span className="font-semibold">Orijinal CV:</span> {optimizedCv.job_match_analyses.cv_analyses.file_name}
            </p>
          </div>
        </div>

        {/* Optimization Notes */}
        {optimizedCv.optimization_notes && optimizedCv.optimization_notes.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-violet-600" />
              </div>
              Yapılan İyileştirmeler
            </h2>
            <div className="grid gap-3">
              {optimizedCv.optimization_notes.map((note, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CV Content */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <FileText className="h-6 w-6 text-violet-600" />
              </div>
              Optimize Edilmiş CV İçeriği
            </h2>
            <div className="flex gap-3">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Kopyala
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Markdown
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    PDF Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    PDF İndir
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700">
            <ReactMarkdown>{optimizedCv.optimized_content}</ReactMarkdown>
          </div>
        </div>

        {/* Hidden PDF Template - Using inline styles to avoid lab() color issues */}
        <div
          id="cv-pdf-template"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: '210mm',
            backgroundColor: '#ffffff',
            padding: '48px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#1f2937',
          }}
        >
          {/* PDF Header */}
          <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #d1d5db' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              {optimizedCv.job_match_analyses.job_title}
            </h1>
            {optimizedCv.job_match_analyses.company_name && (
              <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '12px' }}>
                {optimizedCv.job_match_analyses.company_name}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#4b5563' }}>
              <span style={{ fontWeight: '500' }}>
                Optimize Edilmiş CV • {new Date(optimizedCv.created_at).toLocaleDateString("tr-TR")}
              </span>
              <span style={{
                padding: '4px 12px',
                backgroundColor: '#d1fae5',
                color: '#065f46',
                borderRadius: '9999px',
                fontWeight: '600'
              }}>
                Orijinal Uyum: {optimizedCv.job_match_analyses.match_score}%
              </span>
            </div>
          </div>

          {/* PDF Content - Parse and format markdown */}
          <div style={{ maxWidth: 'none' }}>
            <div
              style={{
                color: '#1f2937',
                lineHeight: '1.75',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            >
              {optimizedCv.optimized_content.split('\n').map((line, index) => {
                // Headers
                if (line.startsWith('# ')) {
                  return (
                    <h1
                      key={index}
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#111827',
                        marginTop: '24px',
                        marginBottom: '12px',
                        borderBottom: '2px solid #e5e7eb',
                        paddingBottom: '8px'
                      }}
                    >
                      {line.replace('# ', '')}
                    </h1>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h2
                      key={index}
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#111827',
                        marginTop: '20px',
                        marginBottom: '8px'
                      }}
                    >
                      {line.replace('## ', '')}
                    </h2>
                  );
                }
                if (line.startsWith('### ')) {
                  return (
                    <h3
                      key={index}
                      style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginTop: '16px',
                        marginBottom: '8px'
                      }}
                    >
                      {line.replace('### ', '')}
                    </h3>
                  );
                }

                // Bold text
                if (line.includes('**')) {
                  const parts = line.split('**');
                  return (
                    <p key={index} style={{ marginBottom: '8px', color: '#1f2937' }}>
                      {parts.map((part, i) =>
                        i % 2 === 0 ? (
                          <span key={i}>{part}</span>
                        ) : (
                          <strong key={i} style={{ fontWeight: '600', color: '#111827' }}>
                            {part}
                          </strong>
                        )
                      )}
                    </p>
                  );
                }

                // Bullet points
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        marginBottom: '4px',
                        marginLeft: '16px'
                      }}
                    >
                      <span style={{ color: '#7c3aed', fontWeight: 'bold', marginTop: '4px' }}>•</span>
                      <span style={{ color: '#1f2937' }}>{line.replace(/^[-*] /, '')}</span>
                    </div>
                  );
                }

                // Empty lines
                if (line.trim() === '') {
                  return <div key={index} style={{ height: '8px' }} />;
                }

                // Regular paragraphs
                return (
                  <p key={index} style={{ marginBottom: '8px', color: '#1f2937' }}>
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          {/* PDF Footer */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #d1d5db', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Bu CV, AI CV Analizi platformu tarafından optimize edilmiştir • www.aicvanalizi.com
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard/job-match">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-12 text-lg px-8">
              Başka İş İlanı Dene
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
