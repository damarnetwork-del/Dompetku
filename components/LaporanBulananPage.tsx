import React from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface FinanceEntry {
  id: number;
  deskripsi: string;
  tanggal: string;
  kategori: string;
  metode: string;
  nominal: number;
}

interface LaporanBulananPageProps {
  onBack: () => void;
  financeHistory: FinanceEntry[];
}

const LaporanBulananPage: React.FC<LaporanBulananPageProps> = ({ onBack, financeHistory }) => {
  const generateReport = () => {
    const report: { [key: string]: { pemasukan: number; pengeluaran: number } } = {};

    financeHistory.forEach(entry => {
      // Group by YYYY-MM for easy sorting
      const monthYearKey = entry.tanggal.substring(0, 7); // "YYYY-MM"

      if (!report[monthYearKey]) {
        report[monthYearKey] = { pemasukan: 0, pengeluaran: 0 };
      }

      if (entry.kategori === 'Pemasukan') {
        report[monthYearKey].pemasukan += entry.nominal;
      } else if (entry.kategori === 'Pengeluaran') {
        report[monthYearKey].pengeluaran += entry.nominal;
      }
    });

    // Sort keys chronologically (descending)
    const sortedKeys = Object.keys(report).sort().reverse();

    // Map to final format with display-friendly month name
    return sortedKeys.map(key => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, 1));
      const displayMonth = date.toLocaleString('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' });

      return {
        month: displayMonth,
        ...report[key],
      };
    });
  };

  const monthlyData = generateReport();

  return (
    <div className="flex-grow flex flex-col">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300"
          aria-label="Kembali ke dasbor"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Kembali</span>
        </button>
      </div>
      
      <main className="flex-grow flex flex-col bg-black/20 rounded-lg p-6 sm:p-8">
        <h2 className="text-3xl font-semibold mb-6 text-center">Rekap Laporan Bulanan</h2>
        
        {monthlyData.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>Belum ada data transaksi untuk ditampilkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthlyData.map(data => {
              const labaRugi = data.pemasukan - data.pengeluaran;
              return (
                <div key={data.month} className="bg-white/5 p-6 rounded-lg shadow-lg flex flex-col">
                  <h3 className="text-xl font-bold text-sky-300 mb-4">{data.month}</h3>
                  <div className="space-y-3 flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Pemasukan:</span>
                      <span className="font-semibold text-green-400">
                        Rp {data.pemasukan.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Pengeluaran:</span>
                      <span className="font-semibold text-red-400">
                        Rp {data.pengeluaran.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <hr className="border-gray-700 my-4"/>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-bold text-gray-300">Laba / Rugi:</span>
                    <span className={`text-lg font-bold ${labaRugi >= 0 ? 'text-white' : 'text-red-400'}`}>
                      Rp {labaRugi.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default LaporanBulananPage;
