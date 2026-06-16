'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Leaf, Clock, Star, ChevronDown, ChevronRight, Check, ArrowRight, Zap, Shield, TrendingDown, Users, Package, TreePine, DollarSign, Store, Quote, Utensils, Coffee, Salad } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { SpotlightButton } from '@/components/ui/spotlight-button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockPartners, mockPlatformStats } from '@/lib/mock-data';

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'mitra'>('customer');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const bags = useCounter(mockPlatformStats.bags_rescued);
  const food = useCounter(mockPlatformStats.kg_food_saved);
  const co2 = useCounter(Math.round(mockPlatformStats.co2_avoided_kg / 1000), 2500);
  const partners = useCounter(mockPartners.filter(p => p.status === 'active').length * 39);

  const faqs = [
    { q: 'Apa itu Rescue Bag?', a: 'Rescue Bag adalah paket makanan surplus berkualitas dari restoran & kafe mitra kami yang dijual dengan diskon 30-70%. Isi paket bervariasi dan selalu segar — disiapkan pada hari yang sama.' },
    { q: 'Bagaimana cara kerjanya?', a: 'Cukup browse Rescue Bag di sekitarmu, pilih yang kamu suka, bayar online, lalu ambil di toko sesuai jam pickup yang tertera. Mudah, cepat, dan hemat!' },
    { q: 'Apakah makanannya masih layak?', a: 'Tentu! Semua makanan yang dijual mitra kami masih 100% layak konsumsi. Ini bukan makanan kadaluarsa — ini makanan surplus yang masih segar dan berkualitas.' },
    { q: 'Bagaimana cara menjadi Mitra?', a: 'Klik tombol "Daftar Mitra", isi form pendaftaran, upload dokumen bisnis, dan tim kami akan review dalam 1-3 hari kerja. Pendaftaran GRATIS!' },
    { q: 'Metode pembayaran apa yang tersedia?', a: 'Saat ini kami mendukung transfer bank manual. Segera hadir: QRIS, GoPay, OVO, Dana, dan pembayaran lainnya.' },
  ];

  const testimonials = [
    { name: 'Reza M.', role: 'Mahasiswa UI', text: 'Gila sih, bisa makan enak dari kafe hits cuma 35rb! SaveBite literally menyelamatkan dompet mahasiswa. 🙌', rating: 5 },
    { name: 'Bu Dewi', role: 'Pemilik Kafe Aroma', text: 'Dulu sisa roti selalu dibuang. Sekarang bisa dapat pemasukan tambahan 2-3jt/bulan dari SaveBite. Win-win!', rating: 5 },
    { name: 'Sarah K.', role: 'Karyawan Swasta', text: 'Senang bisa hemat sekaligus berkontribusi mengurangi food waste. Kualitas makanannya selalu oke!', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/50 via-background to-accent-light/30" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="success" className="mb-5">
                <Leaf size={12} /> #1 Food Rescue Platform Indonesia
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight mb-6">
                Makanan Sisa Jadi{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                  Kesempatan Emas
                </span>
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-lg">
                Beli <strong>Rescue Bag</strong> dari restoran & kafe favoritmu — 
                hingga <span className="text-accent font-bold">70% lebih murah</span>. 
                Hemat lebih, buang lebih sedikit.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/register">
                  <Button size="lg">
                    <ShoppingBag size={20} /> Mulai Hemat
                  </Button>
                </Link>
                <Link href="/register/mitra">
                  <Button variant="outline" size="lg">
                    <Store size={20} /> Daftar Mitra
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6">
                {[{ icon: <Users size={16} />, label: '5k+ Customer' }, { icon: <Store size={16} />, label: '200+ Mitra' }, { icon: <TreePine size={16} />, label: '2t CO₂ Saved' }].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="text-primary">{item.icon}</div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative animate-fade-in delay-200">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-emerald-400 rotate-6 opacity-20" />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-surface/90 mx-auto flex items-center justify-center shadow-xl mb-6 animate-float">
                      <ShoppingBag size={56} className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Rescue Bag</h3>
                    <p className="text-white/80 text-sm">Paket surprise makanan segar</p>
                    <div className="mt-4 bg-surface/20 backdrop-blur-sm rounded-xl px-4 py-2 inline-flex items-center gap-2">
                      <span className="text-white/60 line-through text-sm">Rp85.000</span>
                      <span className="text-white font-extrabold text-lg">Rp35.000</span>
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-3 -right-3 bg-surface rounded-xl shadow-lg px-3 py-2 animate-float delay-300">
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold">4.8</span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -left-3 bg-surface rounded-xl shadow-lg px-3 py-2 animate-float delay-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-accent" />
                    <span className="text-sm font-bold">18:00-20:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== IMPACT TICKER ===== */}
      <section className="bg-[#1A2E24] py-8" id="impact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { ref: bags.ref, count: bags.count, suffix: '', icon: '🥡', label: 'Bags Diselamatkan' },
              { ref: food.ref, count: food.count, suffix: ' kg', icon: '🌿', label: 'Makanan Diselamatkan' },
              { ref: co2.ref, count: co2.count, suffix: ' ton', icon: '🍃', label: 'CO₂ Dihindari' },
              { ref: partners.ref, count: partners.count, suffix: '+', icon: '🏪', label: 'Mitra Aktif' },
            ].map((stat, i) => (
              <div key={i} ref={stat.ref} className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-extrabold text-white">
                  {stat.count.toLocaleString('id-ID')}{stat.suffix}
                </div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 md:py-28" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="success" className="mb-4"><Zap size={12} /> Simpel & Cepat</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">Bagaimana Cara Kerjanya?</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Tiga langkah mudah untuk mulai menyelamatkan makanan</p>
          </div>

          {/* Tab Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-surface border border-border rounded-2xl p-1.5 flex gap-1">
              {(['customer', 'mitra'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-primary'
                  }`}
                >
                  {tab === 'customer' ? '👤 Customer' : '🏪 Mitra'}
                </button>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {(activeTab === 'customer'
              ? [
                  { step: '01', icon: <ShoppingBag size={28} />, title: 'Browse Rescue Bag', desc: 'Temukan Rescue Bag dari restoran & kafe terdekat dengan harga super hemat.' },
                  { step: '02', icon: <DollarSign size={28} />, title: 'Bayar Online', desc: 'Checkout dan bayar dengan mudah. Dapatkan kode pickup unik.' },
                  { step: '03', icon: <Package size={28} />, title: 'Pickup & Enjoy!', desc: 'Datang ke toko, tunjukkan kode pickup, dan nikmati makananmu!' },
                ]
              : [
                  { step: '01', icon: <Store size={28} />, title: 'Daftar Gratis', desc: 'Isi form pendaftaran dan upload dokumen bisnis. Tim kami review dalam 1-3 hari.' },
                  { step: '02', icon: <Package size={28} />, title: 'Buat Rescue Bag', desc: 'Buat paket makanan surplus dengan harga rescue. Atur jam pickup sesukamu.' },
                  { step: '03', icon: <DollarSign size={28} />, title: 'Terima Pesanan', desc: 'Customer order, kamu terima notifikasi. Verifikasi pickup dan dapat pendapatan!' },
                ]
            ).map((item, i) => (
              <Card key={i} hover className="relative text-center group">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">{item.step}</span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary-light mx-auto mb-5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PARTNERS ===== */}
      <section className="py-20 bg-primary-light/50" id="partners">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="success" className="mb-4"><Store size={12} /> Mitra Terpilih</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">Mitra Unggulan Kami</h2>
            <p className="text-text-secondary">Restoran & kafe terbaik yang peduli terhadap food waste</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockPartners.filter(p => p.status === 'active').map((partner, i) => (
              <Card key={partner.id} hover className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-3 flex items-center justify-center">
                  {partner.category?.slug === 'kafe' ? <Coffee size={24} className="text-primary" /> :
                   partner.category?.slug === 'bakeri' ? <Package size={24} className="text-accent" /> :
                   partner.category?.slug === 'sehat' ? <Salad size={24} className="text-emerald-500" /> :
                   <Utensils size={24} className="text-primary" />}
                </div>
                <h4 className="font-bold text-sm text-text-primary mb-1 line-clamp-1">{partner.business_name}</h4>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold">{partner.avg_rating}</span>
                </div>
                <Badge variant="neutral">{partner.category?.name}</Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY SAVEBITE ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">Kenapa SaveBite?</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Bukan sekadar beli makanan murah — kamu juga jadi pahlawan lingkungan</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <TreePine size={28} />, title: 'Ramah Lingkungan', desc: 'Setiap Rescue Bag mengurangi ~2.5kg CO₂. Kontribusi nyata untuk bumi.', color: 'from-emerald-500 to-green-400' },
              { icon: <DollarSign size={28} />, title: 'Harga Terbaik', desc: 'Hemat 30-70% dari harga normal. Makanan premium, harga mahasiswa.', color: 'from-amber-500 to-yellow-400' },
              { icon: <Zap size={28} />, title: 'Mudah & Cepat', desc: 'Browse, bayar, pickup. Kurang dari 3 langkah, kurang dari 3 menit.', color: 'from-blue-500 to-cyan-400' },
              { icon: <Shield size={28} />, title: 'Aman & Terpercaya', desc: 'Semua mitra terverifikasi. Rating transparan. Tanpa hidden fee.', color: 'from-purple-500 to-violet-400' },
            ].map((item, i) => (
              <Card key={i} hover className="group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} mb-5 flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 bg-gradient-to-br from-primary-light/40 to-accent-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4"><Quote size={12} /> Testimoni</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">Apa Kata Mereka?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="relative">
                <div className="absolute -top-3 left-6">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Quote size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mb-4 pt-2">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 md:py-28" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">Pertanyaan Umum</h2>
            <p className="text-text-secondary">Jawaban atas pertanyaan yang sering ditanyakan</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                >
                  <span className="font-semibold text-text-primary pr-4">{faq.q}</span>
                  <ChevronDown size={20} className={`text-text-muted transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 animate-fade-in">
                    <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary to-emerald-400 p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-surface/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-surface/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Siap Mulai Menyelamatkan Makanan?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Bergabung dengan ribuan orang yang sudah hemat dan peduli lingkungan melalui SaveBite.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register">
                  <SpotlightButton>
                    Daftar Sekarang — Gratis <ArrowRight size={18} />
                  </SpotlightButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
