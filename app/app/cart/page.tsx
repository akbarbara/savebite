'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockRescueBags } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();

  const totalSaved = cartItems.reduce((sum, item) => sum + (item.bag.original_price - item.bag.rescue_price) * item.quantity, 0);

  const updateQty = (bagId: string, currentQty: number, delta: number) => {
    updateQuantity(bagId, currentQty + delta);
  };

  const removeItem = (bagId: string) => {
    removeFromCart(bagId);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/app" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6">
        <ArrowLeft size={18} /> Kembali
      </Link>
      <h1 className="text-2xl font-extrabold text-text-primary mb-6">Keranjang ({cartItems.length})</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag size={48} className="text-text-muted mx-auto mb-4" />
          <h3 className="font-bold text-text-primary mb-2">Keranjang Kosong</h3>
          <p className="text-sm text-text-secondary mb-4">Yuk mulai browse Rescue Bag!</p>
          <Link href="/app"><Button>Browse Rescue Bag</Button></Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cartItems.map((item, i) => (
              <div key={item.bag.id} className="bg-surface rounded-2xl border border-border p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={24} className="text-primary/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text-primary truncate">{item.bag.name}</h4>
                  <p className="text-xs text-text-muted">{item.bag.partner?.business_name}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQty(item.bag.id, item.quantity, -1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-background cursor-pointer"><Minus size={14} /></button>
                      <span className="font-bold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.bag.id, item.quantity, 1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-background cursor-pointer"><Plus size={14} /></button>
                    </div>
                    <span className="font-bold text-primary">{formatCurrency(item.bag.rescue_price * item.quantity)}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.bag.id)} className="text-text-muted hover:text-error transition-colors cursor-pointer"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-surface rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-4">Ringkasan Belanja</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-primary"><span>Kamu hemat</span><span className="font-bold">-{formatCurrency(totalSaved)}</span></div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-extrabold text-lg text-primary">{formatCurrency(subtotal)}</span>
              </div>
            </div>
            <Link href="/app/checkout">
              <Button className="w-full mt-4" size="lg">Checkout</Button>
            </Link>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-text-muted">
              <ShieldCheck size={14} /> Transaksi aman & terenkripsi
            </div>
          </div>
        </>
      )}
    </div>
  );
}
