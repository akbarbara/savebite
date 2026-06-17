'use client';
import { useState, useEffect } from 'react';
import { Leaf, DollarSign, Award, Heart, ShieldCheck, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';
import { PageLoader } from '@/components/ui/page-loader';

export default function ImpactDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      // Fetch user's completed orders with bag and partner data
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          bag:rescue_bags(original_price, rescue_price),
          partner:partners(business_name)
        `)
        .eq('customer_id', user.id)
        .eq('status', 'completed');
        
      if (data) setOrders(data as any[]);
      setIsLoading(false);
    }
    fetchOrders();
  }, [user]);

  if (isLoading) return <PageLoader message="Memuat Rapor Pahlawan Bumimu..." />;

  // --- Metrics ---
  const totalItemsSaved = orders.reduce((sum, o) => sum + o.quantity, 0);
  
  // Calculate money saved: sum of (original_price - rescue_price) * quantity
  let totalOriginalPrice = 0;
  let totalPaidPrice = 0;

  orders.forEach(o => {
    if (o.bag) {
      totalOriginalPrice += (o.bag.original_price * o.quantity);
      totalPaidPrice += (o.bag.rescue_price * o.quantity);
    }
  });

  const moneySaved = totalOriginalPrice - totalPaidPrice;

  const kgFoodSaved = totalItemsSaved * 0.5;
  const kgCo2Prevented = totalItemsSaved * 1.25;

  // --- Gamification Level ---
  let levelName = "Pengamat Lingkungan 🧐";
  let levelIcon = <Star size={32} className="text-gray-400 dark:text-gray-500" />;
  let nextGoal = 5;
  let bgGradient = "from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 text-text-primary border-gray-200 dark:border-slate-700";

  if (totalItemsSaved > 0 && totalItemsSaved < 5) {
    levelName = "Pecinta Lingkungan Pemula 🌱";
    levelIcon = <Leaf size={32} className="text-emerald-500" />;
    nextGoal = 5;
    bgGradient = "from-emerald-50 to-emerald-100 dark:from-emerald-950/80 dark:to-emerald-900/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800";
  } else if (totalItemsSaved >= 5 && totalItemsSaved < 20) {
    levelName = "Pejuang Makanan Tangguh 🛡️";
    levelIcon = <ShieldCheck size={32} className="text-blue-500" />;
    nextGoal = 20;
    bgGradient = "from-blue-50 to-blue-100 dark:from-blue-950/80 dark:to-blue-900/80 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800";
  } else if (totalItemsSaved >= 20) {
    levelName = "Pahlawan Penyelamat Bumi 🦸‍♂️🌍";
    levelIcon = <Award size={32} className="text-yellow-500" />;
    nextGoal = totalItemsSaved + 10; // Endless goal
    bgGradient = "from-yellow-100 to-yellow-200 dark:from-yellow-950/80 dark:to-yellow-900/80 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800";
  }

  const progressPercent = Math.min(100, (totalItemsSaved / nextGoal) * 100);

  // --- Favorite Stores (Pie Chart) ---
  const storeCounts: Record<string, number> = {};
  orders.forEach(o => {
    if (!o.partner) return;
    const name = o.partner.business_name;
    storeCounts[name] = (storeCounts[name] || 0) + o.quantity;
  });

  const pieData = Object.entries(storeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4); // Top 4

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-xl shadow-lg">
          <p className="font-bold text-sm text-text-primary mb-1">{payload[0].name}</p>
          <p className="text-primary font-bold">{payload[0].value} porsi diselamatkan</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-text-primary">Dampak Saya 🌍</h1>
        <p className="text-text-secondary mt-1">Setiap gigitan berarti bagi kelestarian bumi!</p>
      </div>

      {/* Gamification Badge */}
      <div className={`rounded-3xl border p-6 mb-8 bg-gradient-to-br ${bgGradient} shadow-sm transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group`}>
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />

        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="w-16 h-16 bg-surface/50 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner relative group-hover:rotate-12 transition-transform duration-500">
            {/* Pulsing ring behind icon */}
            <div className="absolute inset-0 bg-surface/30 rounded-full animate-ping opacity-75" style={{ animationDuration: '3s' }}></div>
            <div className="animate-[bounce_2s_infinite]">
              {levelIcon}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1 flex items-center gap-2">
              Gelar Saat Ini <span className="animate-pulse block w-2 h-2 rounded-full bg-current opacity-50"></span>
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold drop-shadow-sm">{levelName}</h2>
          </div>
        </div>
        
        <div className="space-y-2 mt-6 relative z-10">
          <div className="flex justify-between text-sm font-bold">
            <span>{totalItemsSaved} Porsi</span>
            <span className="animate-pulse">{nextGoal} Porsi (Naik Level)</span>
          </div>
          <div className="h-3 w-full bg-surface/40 rounded-full overflow-hidden shadow-inner relative">
            <div 
              className="absolute left-0 top-0 h-full bg-black/20 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
            {/* Animated shimmer on progress bar using standard tailwind translate */}
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Award size={20} className="text-primary"/> Rangkuman Dampak</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface rounded-2xl border border-border p-5 text-center shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Leaf size={24} />
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{kgFoodSaved.toFixed(1)} kg</p>
          <p className="text-xs font-medium text-text-muted mt-1 uppercase tracking-wide">Makanan Terselamatkan</p>
        </div>
        
        <div className="bg-surface rounded-2xl border border-border p-5 text-center shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={24} />
          </div>
          <p className="text-2xl font-extrabold text-text-primary">{kgCo2Prevented.toFixed(1)} kg</p>
          <p className="text-xs font-medium text-text-muted mt-1 uppercase tracking-wide">Emisi CO₂ Tercegah</p>
        </div>

        <div className="col-span-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl p-6 text-white text-center shadow-md transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group">
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
          
          <div className="w-12 h-12 bg-surface/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-[bounce_3s_infinite]">
            <DollarSign size={24} />
          </div>
          <p className="text-sm font-medium opacity-90 mb-1 uppercase tracking-wider">Total Uang Dihemat</p>
          <p className="text-4xl font-extrabold mb-3 drop-shadow-md">{formatCurrency(moneySaved)}</p>
          <div className="bg-surface/10 rounded-xl py-2 px-4 inline-block text-sm backdrop-blur-sm border border-white/20 shadow-inner">
            <p className="opacity-80 line-through mb-0.5">Seharusnya: {formatCurrency(totalOriginalPrice)}</p>
            <p className="font-bold text-emerald-50 flex items-center justify-center gap-1">
              Kamu cuma bayar: {formatCurrency(totalPaidPrice)} <span className="animate-pulse inline-block">🔥</span>
            </p>
          </div>
        </div>
      </div>

      {/* Favorite Stores */}
      {pieData.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm mb-8">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Heart size={20} className="text-red-500"/> Pahlawan Favoritmu</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-sm hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                  {/* Center Label for Donut Chart */}
                  <Label
                    content={({ viewBox }: any) => {
                      const { cx, cy } = viewBox;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                          <tspan x={cx} dy="-0.2em" fontSize="28" fontWeight="900" fill="#111827">
                            {totalItemsSaved}
                          </tspan>
                          <tspan x={cx} dy="1.5em" fontSize="12" fontWeight="600" fill="#6B7280">
                            Total Porsi
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="text-center bg-surface border border-border rounded-2xl p-8">
          <Leaf size={48} className="mx-auto text-emerald-200 mb-4" />
          <h3 className="font-bold text-lg mb-2">Belum ada penyelamatan</h3>
          <p className="text-text-muted text-sm mb-6">Mulai misi penyelamatan pertamamu dan jadilah Pahlawan Bumi!</p>
        </div>
      )}
    </div>
  );
}
