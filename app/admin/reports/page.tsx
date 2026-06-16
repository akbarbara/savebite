'use client';
import { useState } from 'react';
import { FileText, Download, Calendar, Filter, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { getTransactionsReportData } from '@/app/actions/reports';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminReportsPage() {
  const { addToast } = useToast();
  const [isDownloading, setIsDownloading] = useState<'csv' | 'pdf' | null>(null);
  const [timeRange, setTimeRange] = useState('all');

  const fetchReportData = async () => {
    const { success, data, error } = await getTransactionsReportData();
    if (!success || !data || data.length === 0) {
      addToast('error', error || 'Tidak ada data transaksi untuk diunduh');
      return null;
    }

    // Filter based on timeRange
    let filteredData = data;
    const now = new Date();
    
    if (timeRange === 'today') {
      filteredData = data.filter((d: any) => new Date(d.created_at).toDateString() === now.toDateString());
    } else if (timeRange === 'week') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = data.filter((d: any) => new Date(d.created_at) >= lastWeek);
    } else if (timeRange === 'month') {
      filteredData = data.filter((d: any) => {
        const dDate = new Date(d.created_at);
        return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
      });
    }

    if (filteredData.length === 0) {
      addToast('error', `Tidak ada transaksi untuk rentang waktu yang dipilih.`);
      return null;
    }

    return filteredData;
  };

  const downloadCSV = async () => {
    setIsDownloading('csv');
    try {
      const orders = await fetchReportData();
      if (!orders) return;

      const headers = ['ID Pesanan', 'Tanggal', 'Nama Customer', 'Mitra', 'Rescue Bag', 'Total (Rp)', 'Status', 'Pembayaran'];
      const csvRows = [headers.join(',')];

      orders.forEach((order: any) => {
        const row = [
          order.id,
          new Date(order.created_at).toLocaleString('id-ID'),
          `"${order.customer?.full_name || 'Tanpa Nama'}"`,
          `"${order.partner?.business_name || 'Tanpa Mitra'}"`,
          `"${order.bag?.name || 'Tanpa Bag'}"`,
          order.total_price,
          order.status,
          order.payment_status
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `laporan_transaksi_savebite_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('success', 'Laporan CSV berhasil diunduh!');
    } catch (err: any) {
      addToast('error', 'Gagal mengunduh CSV: ' + err.message);
    } finally {
      setIsDownloading(null);
    }
  };

  const downloadPDF = async () => {
    setIsDownloading('pdf');
    try {
      const orders = await fetchReportData();
      if (!orders) return;

      const doc = new jsPDF('landscape');
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // Primary Emerald
      doc.text('Laporan Ringkasan Transaksi SaveBite', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Periode Cetak: ${new Date().toLocaleString('id-ID')}  |  Diunduh oleh: Admin`, 14, 30);

      // Calculate Summaries
      const totalOrders = orders.length;
      const completedOrders = orders.filter((o: any) => o.status === 'completed' || o.payment_status === 'paid');
      const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
      const totalBags = completedOrders.reduce((sum: number, o: any) => sum + (o.quantity || 1), 0);

      // Draw Summary Boxes
      const drawBox = (x: number, y: number, w: number, h: number, title: string, value: string, iconText: string) => {
        doc.setFillColor(243, 244, 246); // Light gray background
        doc.setDrawColor(229, 231, 235); // Border
        doc.roundedRect(x, y, w, h, 2, 2, 'FD'); // Fill and stroke
        
        doc.setFontSize(20);
        doc.setTextColor(16, 185, 129); // Emerald for icons/accents
        doc.text(iconText, x + 6, y + h - 7);
        
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128); // Gray for label
        doc.text(title, x + 16, y + 8);
        
        doc.setFontSize(14);
        doc.setTextColor(17, 24, 39); // Dark for value
        doc.setFont("helvetica", "bold");
        doc.text(value, x + 16, y + 18);
        doc.setFont("helvetica", "normal");
      };

      const boxWidth = 63;
      const startX = 14;
      const gap = 5;
      
      drawBox(startX, 38, boxWidth, 24, "Total Keseluruhan", `${totalOrders} Pesanan`, "📦");
      drawBox(startX + boxWidth + gap, 38, boxWidth, 24, "Transaksi Sukses", `${completedOrders.length} Pesanan`, "✅");
      drawBox(startX + (boxWidth + gap) * 2, 38, boxWidth, 24, "Total Pendapatan", `Rp ${totalRevenue.toLocaleString('id-ID')}`, "💰");
      drawBox(startX + (boxWidth + gap) * 3, 38, boxWidth, 24, "Dampak Lingkungan", `${(totalBags * 0.5).toFixed(1)} kg Makanan`, "🌍");

      // Table data
      const tableBody = orders.map((order: any) => [
        order.id.slice(0, 8),
        new Date(order.created_at).toLocaleDateString('id-ID'),
        order.customer?.full_name || '-',
        order.partner?.business_name || '-',
        order.bag?.name || '-',
        order.quantity || 1,
        `Rp ${order.total_price.toLocaleString('id-ID')}`,
        order.status,
        order.payment_status
      ]);

      autoTable(doc, {
        startY: 70,
        head: [['ID', 'Tanggal', 'Customer', 'Mitra', 'Rescue Bag', 'Qty', 'Total', 'Status', 'Pembayaran']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' }, // Emerald Green
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] }, // Light gray/slate
        margin: { top: 70, left: 14, right: 14 }
      });

      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 70;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`SaveBite Admin - Internal Confidential. Generated by System.`, 14, finalY + 10);

      doc.save(`laporan_transaksi_savebite_${new Date().toISOString().split('T')[0]}.pdf`);
      addToast('success', 'Laporan PDF Interaktif berhasil diunduh!');
    } catch (err: any) {
      addToast('error', 'Gagal mengunduh PDF: ' + err.message);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-2">Laporan & Analitik</h1>
      <p className="text-text-secondary mb-8">Unduh dan pantau laporan performa platform SaveBite.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Laporan Transaksi */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
              <FileText className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Laporan Transaksi</h3>
              <p className="text-sm text-text-muted">Riwayat semua pesanan dan pembayaran</p>
            </div>
          </div>
          <div className="w-full sm:w-48 mb-6">
            <Select 
              icon={<Calendar size={16} />}
              options={[
                { value: 'all', label: 'Semua Transaksi' },
                { value: 'today', label: 'Hari Ini' },
                { value: 'week', label: '7 Hari Terakhir' },
                { value: 'month', label: 'Bulan Ini' }
              ]}
              value={timeRange}
              onChange={setTimeRange}
            />
          </div>
          <div className="flex gap-3">
            <Button 
              className="flex-1 flex items-center justify-center gap-2" 
              onClick={downloadPDF}
              isLoading={isDownloading === 'pdf'}
              disabled={isDownloading !== null}
            >
              <Download size={18} /> Unduh PDF
            </Button>
            <Button 
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary-light" 
              onClick={downloadCSV}
              isLoading={isDownloading === 'csv'}
              disabled={isDownloading !== null}
            >
              <FileCode size={18} /> Format CSV
            </Button>
          </div>
        </div>

        {/* Laporan Mitra */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Filter className="text-amber-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Performa Mitra</h3>
              <p className="text-sm text-text-muted">Statistik penjualan tiap restoran/toko (Segera Hadir)</p>
            </div>
          </div>
          <Button variant="outline" className="w-full flex items-center justify-center gap-2" disabled>
            <Download size={18} /> Unduh Laporan
          </Button>
        </div>
      </div>
    </div>
  );
}
