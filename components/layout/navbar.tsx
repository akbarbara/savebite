'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

interface NavbarProps {
  variant?: 'public' | 'customer' | 'mitra' | 'admin';
}

export function Navbar({ variant = 'public' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-surface/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-text-primary">
              Save<span className="text-primary">Bite</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Cara Kerja</a>
            <a href="#partners" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Mitra</a>
            <a href="#impact" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Dampak</a>
            <a href="#faq" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">FAQ</a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Mulai Gratis</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-border/50 cursor-pointer">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-2 pt-2">
              <a href="#how-it-works" className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-primary-light hover:text-primary transition-colors">Cara Kerja</a>
              <a href="#partners" className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-primary-light hover:text-primary transition-colors">Mitra</a>
              <a href="#impact" className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-primary-light hover:text-primary transition-colors">Dampak</a>
              <a href="#faq" className="px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-primary-light hover:text-primary transition-colors">FAQ</a>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Ganti Tema</span>
                <ThemeToggle />
              </div>
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Masuk</Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button size="sm" className="w-full">Daftar</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
