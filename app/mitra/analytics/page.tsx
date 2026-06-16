'use client';
import { useState, useEffect } from 'react';
import { Leaf, DollarSign, Package, TrendingUp, Award, Calendar } from 'lucide-react';
import { StatsCard } from '@/components/features/stats-card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Order, Partner } from '@/types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      const { data: partnerData } = await supabase.from('partners').select('*').eq('user_id', user.id).single();
      if (!partnerData) { setIsLoading(false); return; }
      setPartner(partnerData as Partner);

      // Fetch completed orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, bag:rescue_bags(*)')
        .eq('partner_id', partnerData.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true }); // Ascending for chart
        
      if (ordersData) setOrders(ordersData as any[]);
      setIsLoading(false);
    }
    fetchData();
  }, [user]);

  if (isLoading) return <div className="text-center py-20 text-text-muted">Memuat data analitik...</div>;
  if (!partner) return <div className="text-center py-20 text-error">Toko mitra tidak ditemukan.</div>;

  // --- Metrics Calculations ---
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);
  const totalBagsSold = orders.reduce((sum, o) => sum + o.quantity, 0);
  
  // Eco-impact calculations
  const kgFoodSaved = totalBagsSold * 0.5; // Approx 0.5kg per bag
  const kgCo2Prevented = totalBagsSold * 1.25; // Approx 1.25kg CO2 per bag

  // --- Chart Data Processing (Last 7 Days) ---
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(dateStr => {
    const dayOrders = orders.filter(o => o.completed_at?.startsWith(dateStr));
    const revenue = dayOrders.reduce((sum, o) => sum + o.total_price, 0);
    const quantity = dayOrders.reduce((sum, o) => sum + o.quantity, 0);
    // Formatting date to short label e.g., '14 Jun'
    const dateObj = new Date(dateStr);
    const label = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    
    return { date: label, Pendapatan: revenue, Terjual: quantity };
  });

  // --- Top Selling Bags ---
  const bagSales: Record<string, { name: string, qty: number, rev: number }> = {};
  orders.forEach(o => {
    if (!o.bag) return;
    if (!bagSales[o.bag.id]) {
      bagSales[o.bag.id] = { name: o.bag.name, qty: 0, rev: 0 };
    }
    bagSales[o.bag.id].qty += o.quantity;
    bagSales[o.bag.id].rev += o.total_price;
  });

  const topBags = Object.values(bagSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5); // Top 5

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-xl shadow-lg">
          <p className="font-bold text-sm mb-1">{label}</p>
          <p className="text-primary font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-xl shadow-lg">
          <p className="font-bold text-sm mb-1">{label}</p>
          <p className="text-accent font-bold">{payload[0].value} Porsi Terjual</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Analitik Bisnis & Dampak</h1>
          <p className="text-text-secondary mt-1">Perkembangan tokomu dan kontribusimu pada lingkungan</p>
        </div>
      </div>

      {/* Top Stats */}
      <div 
        className="flex lg:grid gap-4 mb-8 overflow-x-auto snap-x snap-mandatory pb-4 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 lg:mx-0 lg:px-0" 
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <StatsCard className="min-w-[260px] lg:min-w-0 snap-start" icon={<DollarSign size={24} />} label="Total Pendapatan" value={formatCurrency(totalRevenue)} />
        <StatsCard className="min-w-[260px] lg:min-w-0 snap-start" icon={<Package size={24} />} label="Total Terjual" value={totalBagsSold} change="porsi" />
        <StatsCard className="min-w-[260px] lg:min-w-0 snap-start bg-emerald-50 border-emerald-100" icon={<Leaf size={24} className="text-emerald-600" />} label="Makanan Terselamatkan" value={`${kgFoodSaved.toFixed(1)} kg`} change="Food Waste Tercegah" />
        <StatsCard className="min-w-[260px] lg:min-w-0 snap-start bg-blue-50 border-blue-100" icon={<TrendingUp size={24} className="text-blue-600" />} label="Emisi CO₂ Tercegah" value={`${kgCo2Prevented.toFixed(1)} kg`} change="Dampak Lingkungan" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Tren Pendapatan</h3>
            <div className="text-xs text-text-muted flex items-center gap-1 bg-border/50 px-2 py-1 rounded-md"><Calendar size={12}/> 7 Hari Terakhir</div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `Rp${value/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Pendapatan" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2"><Package size={18} className="text-accent" /> Volume Penjualan</h3>
            <div className="text-xs text-text-muted flex items-center gap-1 bg-border/50 px-2 py-1 rounded-md"><Calendar size={12}/> 7 Hari Terakhir</div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip content={<CustomTooltipBar />} cursor={{ fill: '#F3F4F6' }} />
                <Bar dataKey="Terjual" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h3 className="font-bold flex items-center gap-2 mb-6"><Award size={18} className="text-yellow-500" /> Rescue Bag Terlaris</h3>
        
        {topBags.length > 0 ? (
          <div className="space-y-4">
            {topBags.map((bag, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center font-bold text-yellow-600">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text-primary truncate">{bag.name}</h4>
                  <p className="text-sm text-text-secondary">{bag.qty} porsi terjual</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-primary">{formatCurrency(bag.rev)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-muted py-8">Belum ada data penjualan yang cukup.</p>
        )}
      </div>
    </div>
  );
}
