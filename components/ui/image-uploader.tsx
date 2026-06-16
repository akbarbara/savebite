'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Edit3 } from 'lucide-react';
import { uploadImage } from '@/app/actions/upload';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from './toast';

interface ImageUploaderProps {
  name: string; // The name of the hidden input
  defaultImage?: string; // Existing image URL
  folder?: string; // e.g., 'bags' or 'profiles'
  label?: string;
  helperText?: string;
  className?: string;
}

export function ImageUploader({ 
  name, 
  defaultImage = '', 
  folder = 'general',
  label = 'Upload Foto',
  helperText = 'JPG, PNG max 5MB',
  className = ''
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(defaultImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFile = async (file: File) => {
    if (!file) return;
    
    // Quick validation before hitting server
    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'Ukuran file terlalu besar (Maks 5MB)');
      return;
    }
    
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    try {
      const result = await uploadImage(formData);
      if (result.success && result.url) {
        setImageUrl(result.url);
        addToast('success', 'Gambar berhasil diunggah!');
      } else {
        addToast('error', result.error || 'Gagal mengunggah gambar');
      }
    } catch (err: any) {
      addToast('error', 'Terjadi kesalahan sistem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={imageUrl} />
      
      {imageUrl ? (
        <div className="relative rounded-2xl border border-border overflow-hidden group">
          <img 
            src={imageUrl} 
            alt="Uploaded preview" 
            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Gambar+Rusak';
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Tooltip content="Ganti Gambar" position="top">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-surface rounded-full text-text-primary hover:text-primary hover:bg-primary-light transition-colors shadow-sm"
                >
                  <Edit3 size={16} />
                </button>
              </Tooltip>
              
              <Tooltip content="Hapus Gambar" position="top">
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-2 bg-surface rounded-full text-error hover:bg-error/10 transition-colors shadow-sm"
                >
                  <X size={16} />
                </button>
              </Tooltip>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[192px]
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-surface'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 size={32} className="text-primary animate-spin mx-auto mb-3" />
              <p className="font-medium text-text-primary animate-pulse">Mengunggah...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-3">
                <ImageIcon size={24} className="text-primary" />
              </div>
              <p className="font-bold text-text-primary">{label}</p>
              <p className="text-xs text-text-muted mt-1">{helperText}</p>
            </>
          )}
        </div>
      )}
      
      {/* Actual hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
}
