import { ShoppingBag, Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Memuat data...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full animate-in fade-in duration-500">
      <div className="relative mb-6 group">
        {/* Outer glowing ring */}
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        
        {/* Main bag icon with bounce */}
        <div className="relative bg-primary text-white p-4 rounded-2xl shadow-xl animate-bounce">
          <ShoppingBag size={40} className="stroke-[1.5]" />
        </div>
        
        {/* Floating little sparkles/dots */}
        <div className="absolute top-0 right-0 -mr-2 -mt-2 w-3 h-3 bg-accent rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
        <div className="absolute bottom-0 left-0 -ml-2 -mb-2 w-2 h-2 bg-emerald-300 rounded-full animate-ping" style={{ animationDelay: '300ms' }}></div>
      </div>
      
      {/* Loading text with spinner */}
      <div className="flex items-center gap-2 text-text-secondary">
        <Loader2 size={16} className="animate-spin text-primary" />
        <span className="font-medium tracking-wide">{message}</span>
      </div>
    </div>
  );
}
