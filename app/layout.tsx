import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI CV Analizi - Profesyonel CV İnceleme ve Değerlendirme",
  description: "CV'nizi yükleyin, yapay zeka destekli analiz alın ve profesyonel geri bildirimlerle CV'nizi geliştirin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  );
}
