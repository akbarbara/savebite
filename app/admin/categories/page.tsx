'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (data) setCategories(data as Category[]);
      setIsLoadingData(false);
    }
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const newCat = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || categories.length + 1,
      icon: 'Tag',
      is_active: true
    };
    
    const { data, error } = await supabase.from('categories').insert([newCat]).select();
    
    if (error) {
      addToast('error', 'Gagal: ' + error.message);
    } else if (data) {
      addToast('success', 'Kategori berhasil ditambahkan');
      setCategories([...categories, data[0] as Category].sort((a, b) => a.sort_order - b.sort_order));
      setShowModal(false);
    }
    setIsSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">Manajemen Kategori</h1>
        <Button onClick={() => setShowModal(true)}><Plus size={18} /> Tambah Kategori</Button>
      </div>

      {isLoadingData ? <div className="text-center py-20">Memuat...</div> : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-gray-50/50">
            <th className="text-left p-4 text-sm font-semibold text-text-secondary">Kategori</th>
            <th className="text-left p-4 text-sm font-semibold text-text-secondary">Slug</th>
            <th className="text-left p-4 text-sm font-semibold text-text-secondary">Urutan</th>
            <th className="text-right p-4 text-sm font-semibold text-text-secondary">Aksi</th>
          </tr></thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} className="border-b border-border last:border-0 hover:bg-primary-light/20">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center"><Tag size={14} className="text-primary" /></div>
                  <span className="font-bold text-sm">{cat.name}</span>
                </td>
                <td className="p-4 text-sm text-text-muted font-mono">{cat.slug}</td>
                <td className="p-4 text-sm">{cat.sort_order}</td>
                <td className="p-4 text-right">
                  <div className="flex gap-1 justify-end">
                    <button className="p-2 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary cursor-pointer"><Edit size={16} /></button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-error cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Kategori" size="sm">
        <form className="space-y-4" onSubmit={handleAddCategory}>
          <Input label="Nama Kategori" name="name" placeholder="Contoh: Dessert" required />
          <Input label="Slug" name="slug" placeholder="dessert" required />
          <Input label="Urutan" name="sort_order" type="number" placeholder="7" />
          <Button type="submit" className="w-full" isLoading={isSaving}>Simpan</Button>
        </form>
      </Modal>
    </div>
  );
}
