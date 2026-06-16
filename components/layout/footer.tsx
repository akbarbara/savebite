import Link from 'next/link';
import { Leaf, Globe, MessageCircle, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1A2E24] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Leaf size={20} className="text-white" />
              </div>
              <span className="text-xl font-extrabold">Save<span className="text-primary">Bite</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Selamatkan makanan, hemat pengeluaran. Platform untuk mengurangi food waste di Indonesia.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"><Globe size={18} /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"><MessageCircle size={18} /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"><Phone size={18} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-primary">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Cara Kerja</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Jadi Mitra</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-primary">Perusahaan</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Karir</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Kontak</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-4 text-primary">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Cookie</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 SaveBite. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mail size={14} />
            <span>hello@savebite.id</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
