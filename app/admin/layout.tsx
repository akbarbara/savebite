'use client';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LayoutDashboard, Store, Users, CreditCard, Tag, FileText, Settings, Landmark } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const sidebarItems = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Mitra', href: '/admin/partners', icon: <Store size={20} /> },
    { label: 'Customer', href: '/admin/customers', icon: <Users size={20} /> },
    { label: 'Transaksi', href: '/admin/transactions', icon: <CreditCard size={20} /> },
    { label: 'Penarikan Dana', href: '/admin/withdrawals', icon: <Landmark size={20} /> },
    { label: 'Kategori', href: '/admin/categories', icon: <Tag size={20} /> },
    { label: 'Laporan', href: '/admin/reports', icon: <FileText size={20} /> },
    { label: 'Pengaturan', href: '/admin/settings', icon: <Settings size={20} /> },
  ];
  return <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Admin Panel">{children}</DashboardLayout>;
}
