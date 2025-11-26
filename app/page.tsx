"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Upload, Sparkles, TrendingUp, FileText,
  Zap, Shield, Clock, Target, Star, Award, Brain, Rocket
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative h-10 w-10 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              AI CV Analizi
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#ozellikler" className="text-gray-700 hover:text-violet-600 transition-colors font-medium relative group">
              Özellikler
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#nasil-calisir" className="text-gray-700 hover:text-violet-600 transition-colors font-medium relative group">
              Nasıl Çalışır
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-violet-600 transition-colors font-medium relative group">
              Yorumlar
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="hidden sm:block">Giriş Yap</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300">
                Ücretsiz Dene
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div className="inline-block animate-bounce-slow">
            <span className="bg-gradient-to-r from-violet-100 to-indigo-100 text-transparent bg-clip-text border-2 border-violet-200 px-5 py-2 rounded-full text-sm font-bold shadow-lg">
              ✨ Yapay Zeka Gücünde CV Analizi
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-gray-900 leading-tight tracking-tight">
            CV'nizi{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                Profesyonel
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 8 Q 50 2, 100 8 T 200 8" stroke="url(#gradient)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />
            Seviyeye Taşıyın
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Yapay zeka destekli analizle CV'nizi saniyeler içinde değerlendirin,
            <span className="font-semibold text-violet-600"> detaylı geri bildirimler </span>
            alın ve iş başvurularınızda
            <span className="font-semibold text-indigo-600"> öne çıkın</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 transform hover:-translate-y-1 transition-all duration-300 text-lg px-10">
                <Upload className="mr-2 h-6 w-6" />
                Hemen Analiz Et
                <Sparkles className="ml-2 h-5 w-5 animate-pulse" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-violet-300 hover:border-violet-500 hover:bg-violet-50 transition-all duration-300 text-lg px-10">
              <Star className="mr-2 h-5 w-5 text-yellow-500" />
              Örnek Sonuç Gör
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-10 text-sm">
            {[
              { icon: CheckCircle2, text: "3 Ücretsiz Deneme", color: "text-green-600" },
              { icon: Shield, text: "Güvenli & Gizli", color: "text-blue-600" },
              { icon: Clock, text: "30 Saniyede Sonuç", color: "text-orange-600" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 group hover:scale-110 transition-transform duration-300">
                <item.icon className={`h-5 w-5 ${item.color} group-hover:animate-bounce`} />
                <span className="text-gray-700 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Animation */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { number: "25K+", label: "Analiz Edildi", icon: FileText, color: "from-blue-500 to-cyan-500", delay: "0" },
            { number: "98%", label: "Memnuniyet", icon: TrendingUp, color: "from-green-500 to-emerald-500", delay: "100" },
            { number: "15sn", label: "Ortalama Süre", icon: Zap, color: "from-yellow-500 to-orange-500", delay: "200" },
            { number: "4.9/5", label: "Kullanıcı Puanı", icon: Star, color: "from-purple-500 to-pink-500", delay: "300" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
              style={{ animationDelay: `${stat.delay}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-5xl font-black text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
              <div className="text-gray-600 font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section id="nasil-calisir" className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block">
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                Süper Kolay
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900">
              3 Basit Adım
            </h2>
            <p className="text-xl text-gray-600">
              Kariyerinizi bir sonraki seviyeye taşımanız için gereken her şey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "CV'nizi Yükleyin",
                description: "PDF veya Word formatında CV'nizi sisteme yükleyin. Drag & drop ile kolayca!",
                icon: Upload,
                color: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-50",
              },
              {
                step: "2",
                title: "AI Analizi Başlasın",
                description: "Güçlü yapay zeka motorumuz CV'nizi 8 farklı kritere göre analiz eder",
                icon: Brain,
                color: "from-purple-500 to-pink-500",
                bgColor: "bg-purple-50",
              },
              {
                step: "3",
                title: "Sonuçları Keşfedin",
                description: "Detaylı skorlar, grafikler ve özelleştirilmiş iyileştirme önerileri alın",
                icon: Rocket,
                color: "from-orange-500 to-red-500",
                bgColor: "bg-orange-50",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                <div className={`relative ${item.bgColor} rounded-3xl p-8 shadow-xl border-2 border-white hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 h-full`}>
                  <div className={`absolute -top-6 -left-6 h-16 w-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                    {item.step}
                  </div>
                  <div className="mt-8 space-y-4">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - More Colorful */}
      <section id="ozellikler" className="container mx-auto px-4 py-24 bg-gradient-to-b from-white to-violet-50 rounded-[4rem] my-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900">
              Güçlü <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Özellikler</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              CV'nizi her açıdan analiz eden kapsamlı araçlar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "İletişim Bilgileri", description: "Profesyonel iletişim bilgisi kontrolü", icon: "📞", color: "from-blue-500 to-cyan-500" },
              { title: "Profesyonel Özet", description: "Etkileyici özet analizi ve önerileri", icon: "📝", color: "from-purple-500 to-pink-500" },
              { title: "İş Deneyimi", description: "Deneyim detayları ve başarı ölçümleri", icon: "💼", color: "from-green-500 to-emerald-500" },
              { title: "Eğitim Geçmişi", description: "Akademik bilgilerin tam sunumu", icon: "🎓", color: "from-yellow-500 to-orange-500" },
              { title: "Beceri Analizi", description: "Sektörel beceri uyumluluk kontrolü", icon: "⚡", color: "from-red-500 to-pink-500" },
              { title: "ATS Uyumluluğu", description: "Tarama sistemleri için optimizasyon", icon: "🤖", color: "from-indigo-500 to-purple-500" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative">
                  <div className="text-6xl mb-6 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 inline-block">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className={`mt-4 inline-flex items-center text-sm font-semibold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    Daha Fazla Bilgi <span className="ml-1">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900">
              Kullanıcılarımız <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Ne Diyor</span>
            </h2>
            <p className="text-xl text-gray-600">Binlerce mutlu kullanıcıdan bazıları</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Ayşe Yılmaz", role: "Yazılım Geliştirici", avatar: "👩‍💻", rating: 5, comment: "CV'mi analiz ettikten sonra aldığım geri bildirimlerle mülakata çağrılma oranım %70 arttı! Harika bir araç." },
              { name: "Mehmet Kaya", role: "Pazarlama Müdürü", avatar: "👨‍💼", rating: 5, comment: "AI analizi sayesinde CV'mdeki eksiklikleri gördüm. Öneriler çok detaylı ve işe yarıyor. Kesinlikle tavsiye ederim!" },
              { name: "Zeynep Demir", role: "İnsan Kaynakları", avatar: "👩‍💼", rating: 5, comment: "Adaylara önermek için harika bir platform. 30 saniyede kapsamlı analiz, gerçekten etkileyici teknoloji." },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.comment}"</p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - More Dynamic */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-[3rem] blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl overflow-hidden">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6 animate-bounce-slow">
                <Award className="h-5 w-5" />
                <span className="font-bold">Sınırlı Süre Teklifi</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Hayalinizdeki İşe<br/>
                Bir Adım Daha Yakın!
              </h2>
              <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto">
                CV'nizi yükleyin ve saniyeler içinde profesyonel analiz alın. İlk 3 analiz tamamen ücretsiz!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <Link href="/auth/signup">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-violet-600 hover:bg-gray-100 shadow-2xl text-lg px-10 transform hover:scale-105 transition-all duration-300">
                    <Upload className="mr-2 h-6 w-6" />
                    Ücretsiz Analiz Başlat
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <p className="mt-8 text-sm opacity-90 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Kredi kartı bilgisi gerekmez • 3 ücretsiz analiz hakkı • Anında sonuç
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="border-t bg-gradient-to-b from-gray-50 to-gray-100 mt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  AI CV Analizi
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed max-w-sm">
                Yapay zeka destekli CV analizi ile kariyerinizi bir üst seviyeye taşıyın.
                Profesyonel geri bildirimler, detaylı analizler ve kişiselleştirilmiş öneriler.
              </p>
              <div className="flex gap-4">
                {["twitter", "linkedin", "instagram"].map((_, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 hover:from-violet-600 hover:to-indigo-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-md"
                  >
                    <Target className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Ürün</h4>
              <ul className="space-y-3">
                {["Özellikler", "Fiyatlandırma", "Nasıl Çalışır", "API"].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors hover:translate-x-1 inline-block duration-300">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Şirket</h4>
              <ul className="space-y-3">
                {["Hakkımızda", "Blog", "Kariyer", "İletişim"].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors hover:translate-x-1 inline-block duration-300">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Yasal</h4>
              <ul className="space-y-3">
                {["Gizlilik Politikası", "Kullanım Şartları", "KVKK", "Çerez Politikası"].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-gray-600 hover:text-violet-600 transition-colors hover:translate-x-1 inline-block duration-300">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              &copy; 2025 AI CV Analizi. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Türkiye'de</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>ile yapıldı</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom animations in style tag */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
      `}</style>
    </div>
  );
}
