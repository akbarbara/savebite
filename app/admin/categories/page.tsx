'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';
import { Category } from '@/types';
import { saveCategoryAdmin, deleteCategoryAdmin } from '@/app/actions/admin';

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (data) setCategories(data as Category[]);
      setIsLoadingData(false);
    }
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditCategory(null);
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditCategory(cat);
    setShowModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const catData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || categories.length + 1,
      icon: 'Tag',
      is_active: true
    };
    
    const result = await saveCategoryAdmin(catData, editCategory?.id);
    
    if (!result.success) {
      addToast('error', 'Gagal menyimpan: ' + result.error);
    } else if (result.data) {
      addToast('success', editCategory ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan');
      if (editCategory) {
        setCategories(categories.map(c => c.id === editCategory.id ? result.data[0] as Category : c).sort((a, b) => a.sort_order - b.sort_order));
      } else {
        setCategories([...categories, result.data[0] as Category].sort((a, b) => a.sort_order - b.sort_order));
      }
      setShowModal(false);
    }
    
    setIsSaving(false);
  };

  const handleDeleteClick = async (cat: Category) => {
    setDeleteCategory(cat);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategory) return;
    setIsDeleting(true);
    
    const result = await deleteCategoryAdmin(deleteCategory.id);
    
    if (!result.success) {
      addToast('error', result.error || 'Gagal menghapus kategori');
    } else {
      addToast('success', 'Kategori berhasil dihapus');
      setCategories(categories.filter(c => c.id !== deleteCategory.id));
      setDeleteCategory(null);
    }
    setIsDeleting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">Manajemen Kategori</h1>
        <Button onClick={openAddModal}><Plus size={18} /> Tambah Kategori</Button>
      </div>

      {isLoadingData ? <PageLoader message="Memuat..." /> : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-background/50">
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
                    <button onClick={() => openEditModal(cat)} className="p-2 rounded-lg hover:bg-primary-light text-text-muted hover:text-primary cursor-pointer"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteClick(cat)} className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-error cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCategory ? "Edit Kategori" : "Tambah Kategori"} size="sm">
        <form className="space-y-4" onSubmit={handleSaveCategory}>
          <Input label="Nama Kategori" name="name" defaultValue={editCategory?.name || ''} placeholder="Contoh: Dessert" required />
          <Input label="Slug" name="slug" defaultValue={editCategory?.slug || ''} placeholder="dessert" required />
          <Input label="Urutan" name="sort_order" type="number" defaultValue={editCategory?.sort_order?.toString() || ''} placeholder="7" />
          <Button type="submit" className="w-full" isLoading={isSaving}>{editCategory ? 'Simpan Perubahan' : 'Simpan Kategori Baru'}</Button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteCategory} onClose={() => setDeleteCategory(null)} title="Hapus Kategori" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-text-primary">"{deleteCategory?.name}"</span>? 
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteCategory(null)}>Batal</Button>
            <Button variant="danger" className="flex-1" isLoading={isDeleting} onClick={confirmDeleteCategory}>Ya, Hapus</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
