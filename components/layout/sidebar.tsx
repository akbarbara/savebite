'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Leaf, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
}

import { Modal } from '@/components/ui/modal';

export function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface rounded-xl border border-border shadow-md cursor-pointer"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 h-full bg-surface border-r border-border animate-slide-in-right">
            <SidebarContent items={items} pathname={pathname} title={title} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 bg-surface border-r border-border transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}>
        <SidebarContent items={items} pathname={pathname} title={title} collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
      </div>
    </>
  );
}

function SidebarContent({ items, pathname, title, collapsed, onClose, onCollapse }: {
  items: SidebarItem[]; pathname: string; title?: string;
  collapsed?: boolean; onClose?: () => void; onCollapse?: () => void;
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm">Save<span className="text-primary">Bite</span></span>
              {title && <p className="text-[10px] text-text-muted">{title}</p>}
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Leaf size={16} className="text-white" />
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-border/50 cursor-pointer">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          // Exact match is always active
          let isActive = pathname === item.href;
          // Partial match only if it's a sub-route (e.g. /mitra/bags/edit/1 belongs to /mitra/bags)
          // but explicitly prevent parent routes like /mitra/orders from matching /mitra/orders/history
          if (!isActive && item.href !== '/' && item.href !== '/mitra' && item.href !== '/app' && item.href !== '/admin') {
             // Check if pathname starts with href + '/'
             if (pathname.startsWith(item.href + '/')) {
               // Only active if there isn't a more specific exact match in the items list
               const hasMoreSpecificMatch = items.some(otherItem => 
                 otherItem.href !== item.href && 
                 pathname.startsWith(otherItem.href) && 
                 otherItem.href.length > item.href.length
               );
               if (!hasMoreSpecificMatch) {
                 isActive = true;
               }
             }
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'relative flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-primary-light hover:text-primary',
                collapsed && 'justify-center px-2'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {item.icon}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>
              
              {/* Badge Display */}
              {!collapsed && item.badge !== undefined && item.badge !== 0 && (
                <div className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 animate-in zoom-in",
                  isActive ? "bg-surface text-primary" : "bg-red-500 text-white"
                )}>
                  {item.badge}
                </div>
              )}
              {collapsed && item.badge !== undefined && item.badge !== 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse border border-white" />
              )}
            </Link>
          );
        })}

        <button
          onClick={() => setShowLogoutModal(true)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-2 text-error hover:bg-error/5 cursor-pointer',
            collapsed && 'justify-center px-2'
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          {!collapsed && <span>Keluar</span>}
        </button>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Konfirmasi Keluar" size="sm">
        <div className="space-y-6">
          <p className="text-sm text-text-secondary text-center">
            Apakah Anda yakin ingin keluar dari akun ini?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-border text-text-primary font-medium hover:bg-background transition-colors"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                setShowLogoutModal(false);
                await logout();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-error text-white font-medium hover:bg-error/90 transition-colors"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>

      {/* Collapse Toggle (Desktop) */}
      <div className="p-3 border-t border-border flex flex-col gap-2">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
          {!collapsed && <span className="text-xs font-bold text-text-muted">Tema</span>}
          <div className="flex justify-center"><ThemeToggle /></div>
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:bg-border/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ChevronRight size={16} className={cn('transition-transform', !collapsed && 'rotate-180')} />
            {!collapsed && <span>Tutup Menu</span>}
          </button>
        )}
      </div>
    </div>
  );
}
