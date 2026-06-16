'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, Store, ChevronRight, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { Partner, Category } from '@/types';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name'); // name, rating_desc
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch active partners
      const { data: partnersData } = await supabase
        .from('partners')
        .select('*, category:categories(*)')
        .eq('status', 'active');
        
      if (partnersData) setPartners(partnersData as Partner[]);

      // Fetch active categories
      const { data: catsData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (catsData) setCategories(catsData as Category[]);

      setIsLoading(false);
    }
    fetchData();
  }, []);

  // Apply filters and sorting
  let filteredPartners = partners.filter(p => {
    const matchesSearch = p.business_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.category?.name.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'rating_desc') {
    filteredPartners = filteredPartners.sort((a, b) => b.avg_rating - a.avg_rating);
  } else {
    filteredPartners = filteredPartners.sort((a, b) => a.business_name.localeCompare(b.business_name));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
      <h1 className="text-2xl font-extrabold text-text-primary mb-6">Cari Restoran & Mitra 🏪</h1>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          placeholder="Cari nama restoran, kafe, atau kategori..."
          icon={<Search size={18} />}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedCategory === 'all' ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary/50'}`}
          >
            Semua Kategori
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedCategory === cat.id ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary/50'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm relative z-40">
          <Filter size={16} className="text-text-muted" />
          <span className="text-text-secondary font-medium">Urutkan:</span>
          
          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-between gap-2 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary text-text-primary font-medium hover:border-primary/50 transition-colors w-44 cursor-pointer shadow-sm"
            >
              <span>{sortBy === 'name' ? 'A-Z (Abjad)' : 'Rating Tertinggi ⭐'}</span>
              <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsSortOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-44 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1">
                  <button 
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors cursor-pointer ${sortBy === 'name' ? 'font-bold text-primary bg-primary/5' : 'text-text-primary'}`}
                    onClick={() => { setSortBy('name'); setIsSortOpen(false); }}
                  >
                    A-Z (Abjad)
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors cursor-pointer ${sortBy === 'rating_desc' ? 'font-bold text-primary bg-primary/5' : 'text-text-primary'}`}
                    onClick={() => { setSortBy('rating_desc'); setIsSortOpen(false); }}
                  >
                    Rating Tertinggi ⭐
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-text-muted">Mencari mitra...</div>
        ) : filteredPartners.length > 0 ? (
          filteredPartners.map(partner => (
            <Link key={partner.id} href={`/app/partner/${partner.id}`}>
              <div className="bg-surface rounded-2xl border border-border p-4 hover:border-primary/50 transition-colors flex gap-4 cursor-pointer group shadow-sm hover:shadow-md">
                <div className="w-20 h-20 rounded-xl bg-primary-light/50 flex items-center justify-center flex-shrink-0">
                  {partner.logo_url ? (
                    <img src={partner.logo_url} alt={partner.business_name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Store size={24} className="text-primary/70" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-text-primary text-lg truncate pr-2 group-hover:text-primary transition-colors">
                      {partner.business_name}
                    </h3>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
                      <Star size={12} className="fill-amber-500" />
                      {partner.avg_rating}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="neutral" className="text-[10px] py-0.5">{partner.category?.name || 'Tanpa Kategori'}</Badge>
                    <span className="text-xs text-text-muted flex items-center gap-1 truncate">
                      <MapPin size={12} /> {partner.address}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary line-clamp-1">{partner.description || 'Mitra SaveBite'}</p>
                </div>
                <div className="flex items-center">
                  <ChevronRight size={20} className="text-text-muted group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-16 bg-surface border border-border rounded-2xl">
            <Store size={48} className="text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-text-primary mb-2">Mitra tidak ditemukan</h3>
            <p className="text-sm text-text-secondary">Coba ubah filter atau kata kunci pencarianmu.</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('all');}} 
              className="mt-4 px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors text-sm"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
