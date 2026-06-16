'use client';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function SpotlightButton({ children, className, onClick, ...props }: SpotlightButtonProps) {
  const divRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples((prev) => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-surface px-8 py-3.5 font-bold text-primary shadow-lg transition-all duration-300 outline-none hover:scale-105 active:scale-95 hover:shadow-xl",
        className
      )}
      {...props}
    >
      {/* Spotlight Effect (Light Green Gradient) */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(150px circle at ${position.x}px ${position.y}px, var(--color-primary-light), transparent 80%)`,
        }}
      />
      
      {/* Ripple Effect (Solid Light Green spreading out) */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute z-10 bg-primary-light animate-ripple pointer-events-none rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '200%',
            aspectRatio: '1 / 1',
            transform: 'translate(-50%, -50%) scale(0)',
          }}
        />
      ))}

      {/* Button Content */}
      <span className="relative z-20 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
