'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Home, Search, ShoppingBag, ClipboardList, User, Leaf, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

import { ThemeToggle } from '@/components/theme-toggle';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'customer') {
      if (user.role === 'mitra') router.replace('/mitra');
      if (user.role === 'admin') router.replace('/admin');
    }
  }, [user, isLoading, router]);

  if (!isLoading && user && user.role !== 'customer') {
    return <div className="min-h-screen flex items-center justify-center text-text-muted">Mengalihkan ke dashboard yang benar...</div>;
  }

  const navItems = [
    { href: '/app', icon: <Home size={20} />, label: 'Home' },
    { href: '/app/search', icon: <Search size={20} />, label: 'Cari' },
    { href: '/app/cart', icon: <ShoppingBag size={20} />, label: 'Keranjang', badge: totalItems > 0 ? totalItems : null },
    { href: '/app/orders', icon: <ClipboardList size={20} />, label: 'Pesanan' },
    { href: '/app/impact', icon: <Award size={20} />, label: 'Dampak' },
    { href: '/app/profile', icon: <User size={20} />, label: 'Profil' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Top Navbar (Mobile & Desktop) */}
      <nav className="sticky top-0 z-40 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 lg:h-16">
          <Link href="/app" className="flex items-center gap-2">
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf size={14} className="text-white lg:w-4 lg:h-4" />
            </div>
            <span className="text-lg font-extrabold">Save<span className="text-primary">Bite</span></span>
          </Link>
          
          <div className="flex items-center gap-2 lg:gap-6">
            {/* Nav Links (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-6">
              {navItems.map(item => (
                <Link key={item.href} href={item.href} className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors relative',
                  pathname === item.href ? 'text-primary' : 'text-text-secondary hover:text-primary'
                )}>
                  <div className="relative">
                    {item.icon}
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="w-px h-6 bg-border mx-2"></div>
            </div>
            
            {/* Theme Toggle (Mobile & Desktop) */}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Bottom Nav (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-b-0 border-t">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative',
                isActive ? 'text-primary' : 'text-text-muted'
              )}>
                <div className="relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 bg-accent text-white text-[10px] font-bold px-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
