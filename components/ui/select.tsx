'use client';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  required?: boolean;
  name?: string;
  icon?: React.ReactNode;
}

export function Select({ 
  label, 
  error, 
  options, 
  placeholder = "Pilih salah satu...", 
  value, 
  onChange, 
  className,
  required,
  name,
  icon
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border bg-surface text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20',
            isOpen ? 'border-primary shadow-sm' : 'border-border hover:border-primary/50',
            error && 'border-error',
            icon ? 'pl-10' : ''
          )}
        >
          {icon && (
            <div className="absolute left-3 text-text-muted">
              {icon}
            </div>
          )}
          <span className={cn("block truncate text-sm", !selectedOption && "text-text-muted")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={16} className={cn("text-text-muted transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        {/* Custom Dropdown List */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-200">
            <ul className="py-1">
              {options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between",
                    value === opt.value 
                      ? "bg-primary-light/50 text-primary font-medium" 
                      : "text-text-primary hover:bg-gray-50"
                  )}
                >
                  <span className="block truncate">{opt.label}</span>
                  {value === opt.value && <Check size={16} className="text-primary" />}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Hidden input for form submission & native validation if needed */}
        <input 
          type="hidden" 
          name={name} 
          value={value || ''} 
          required={required} 
        />
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
