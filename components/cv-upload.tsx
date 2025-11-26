"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2, AlertCircle } from "lucide-react";

interface CVUploadProps {
  userId: string;
  credits: number;
  onUploadSuccess: () => void;
}

export function CVUpload({ userId, credits, onUploadSuccess }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    if (selectedFile.type !== "application/pdf") {
      setError("Sadece PDF dosyaları kabul edilmektedir");
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (credits <= 0) {
      setError("Krediniz kalmadı. Lütfen kredi satın alın.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("cv-uploads")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("cv-uploads")
        .getPublicUrl(fileName);

      // Create CV analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from("cv_analyses")
        .insert({
          user_id: userId,
          file_name: file.name,
          file_url: fileName,
          file_size: file.size,
          status: "pending",
        })
        .select()
        .single();

      if (analysisError) {
        throw analysisError;
      }

      // Trigger analysis
      const response = await fetch("/api/analyze-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisId: analysisData.id,
          fileName: fileName,
        }),
      });

      if (!response.ok) {
        throw new Error("CV analizi başlatılamadı");
      }

      // Reset form
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Notify parent component
      onUploadSuccess();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Dosya yüklenirken bir hata oluştu");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (credits <= 0) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-800 font-semibold mb-4">
          Krediniz kalmadı!
        </p>
        <p className="text-sm text-red-700 mb-6">
          CV analizi yapmak için kredi satın almanız gerekmektedir.
        </p>
        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
          Kredi Satın Al
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!file ? (
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
            ${dragActive
              ? "border-violet-400 bg-violet-50"
              : "border-gray-300 bg-gray-50 hover:border-violet-400"
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 mb-2">
            CV dosyanızı buraya sürükleyin
          </p>
          <p className="text-sm text-gray-500 mb-4">
            veya dosya seçmek için tıklayın
          </p>
          <p className="text-xs text-gray-400">
            Maksimum dosya boyutu: 10MB • Desteklenen format: PDF
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isUploading}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/30"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Analiz Et (1 Kredi)
                </>
              )}
            </Button>
            <Button
              onClick={removeFile}
              variant="outline"
              disabled={isUploading}
              className="border-2"
            >
              İptal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
