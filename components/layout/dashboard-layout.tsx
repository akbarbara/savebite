import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: { label: string; href: string; icon: React.ReactNode; badge?: number | string }[];
  sidebarTitle?: string;
}

export function DashboardLayout({ children, sidebarItems, sidebarTitle }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} title={sidebarTitle} />
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
