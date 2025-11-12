import React, { useState } from 'react';
import SirekapPage from './SirekapPage';
import LaporanBulananPage from './LaporanBulananPage';
import * as Recharts from 'recharts';

// Destructure components from the Recharts namespace
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;


interface DashboardPageProps {
  onLogout: () => void;
  username: string;
}

// Interfaces moved from SirekapPage
interface Customer {
  id: number;
  nama: string;
  noHp: string;
  jenisLangganan: string;
  alamat: string;
  harga: string;
  status: 'Lunas' | 'Belum Lunas';
  tunggakan: number;
}

interface FinanceEntry {
  id: number;
  deskripsi: string;
  tanggal: string;
  kategori: string;
  metode: string;
  nominal: number;
}

// Initial data moved from SirekapPage
const initialCustomers: Customer[] = [
    {
      id: 1,
      nama: 'Damar',
      noHp: '081234567890',
      jenisLangganan: 'PPPoE',
      alamat: 'Jl. Merdeka No. 1, Jakarta',
      harga: '200000',
      status: 'Belum Lunas',
      tunggakan: 0,
    },
    {
      id: 2,
      nama: 'Budi Santoso',
      noHp: '087654321098',
      jenisLangganan: 'Hotspot',
      alamat: 'Jl. Pahlawan No. 2, Surabaya',
      harga: '150000',
      status: 'Lunas',
      tunggakan: 0,
    },
    {
      id: 3,
      nama: 'Citra Lestari',
      noHp: '089988776655',
      jenisLangganan: 'Static',
      alamat: 'Jl. Cendrawasih No. 3, Bandung',
      harga: '300000',
      status: 'Belum Lunas',
      tunggakan: 300000,
    },
];

const initialFinanceHistory: FinanceEntry[] = [
    {
      id: 1,
      deskripsi: 'Pembayaran langganan - Budi Santoso',
      tanggal: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
      kategori: 'Pemasukan',
      metode: 'Transfer',
      nominal: 150000,
    },
    {
      id: 2,
      deskripsi: 'Pembelian Router Tambahan',
      tanggal: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0],
      kategori: 'Pengeluaran',
      metode: 'Tunai',
      nominal: 450000,
    },
    {
      id: 3,
      deskripsi: 'Biaya Listrik Kantor',
      tanggal: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
      kategori: 'Pengeluaran',
      metode: 'Transfer',
      nominal: 250000,
    },
     {
      id: 4,
      deskripsi: 'Pemasangan baru - Pelanggan X',
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'Pemasukan',
      metode: 'Tunai',
      nominal: 500000,
    },
];

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout, username }) => {
  const [showSirekap, setShowSirekap] = useState(false);
  const [showLaporan, setShowLaporan] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [financeHistory, setFinanceHistory] = useState<FinanceEntry[]>(initialFinanceHistory);


  const handleSirekapClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowSirekap(true);
    setShowLaporan(false);
  };

  const handleLaporanClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowLaporan(true);
    setShowSirekap(false);
  };

  const handleBack = () => {
    setShowSirekap(false);
    setShowLaporan(false);
  };
  
  const getPageTitle = () => {
    if (showSirekap) return 'Sirekap';
    if (showLaporan) return 'Laporan Bulanan';
    return 'Dasbor';
  };

  const renderFinancialVisualisation = () => {
    if (financeHistory.length === 0) {
      const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);
      return (
        <div className="text-center text-gray-400">
          <p className="text-3xl">Selamat Datang, {capitalizedUsername}!</p>
          <p className="mt-4 text-gray-300 text-lg">Belum ada data keuangan untuk ditampilkan.</p>
        </div>
      );
    }
    
    // Calculate summary data
    const totalPemasukan = financeHistory
        .filter(e => e.kategori === 'Pemasukan')
        .reduce((acc, e) => acc + e.nominal, 0);

    const totalPengeluaran = financeHistory
        .filter(e => e.kategori === 'Pengeluaran')
        .reduce((acc, e) => acc + e.nominal, 0);
    
    const saldoAkhir = totalPemasukan - totalPengeluaran;

    const pemasukanTransfer = financeHistory
        .filter(e => e.kategori === 'Pemasukan' && e.metode === 'Transfer')
        .reduce((acc, e) => acc + e.nominal, 0);
    const pemasukanTunai = financeHistory
        .filter(e => e.kategori === 'Pemasukan' && e.metode === 'Tunai')
        .reduce((acc, e) => acc + e.nominal, 0);
    
    const pengeluaranTransfer = financeHistory
        .filter(e => e.kategori === 'Pengeluaran' && e.metode === 'Transfer')
        .reduce((acc, e) => acc + e.nominal, 0);
    const pengeluaranTunai = financeHistory
        .filter(e => e.kategori === 'Pengeluaran' && e.metode === 'Tunai')
        .reduce((acc, e) => acc + e.nominal, 0);

    const chartData = [
      { name: 'Transfer', Pemasukan: pemasukanTransfer, Pengeluaran: pengeluaranTransfer },
      { name: 'Tunai', Pemasukan: pemasukanTunai, Pengeluaran: pengeluaranTunai },
    ];
    
    return (
       <div className="bg-black/20 rounded-lg p-6 sm:p-8 w-full flex-grow">
          <h2 className="text-3xl font-semibold mb-6 text-center">Ringkasan Keuangan</h2>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
              <div className="bg-green-500/10 p-4 rounded-lg">
                  <p className="text-sm text-green-400 font-semibold">Total Pemasukan</p>
                  <p className="text-2xl font-bold text-white">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-red-500/10 p-4 rounded-lg">
                  <p className="text-sm text-red-400 font-semibold">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-white">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-sky-500/10 p-4 rounded-lg">
                  <p className="text-sm text-sky-400 font-semibold">Saldo Akhir</p>
                  <p className={`text-2xl font-bold ${saldoAkhir >= 0 ? 'text-white' : 'text-red-400'}`}>
                    Rp {saldoAkhir.toLocaleString('id-ID')}
                  </p>
              </div>
          </div>

          {/* New Recharts Bar Chart */}
          <div className="w-full h-80 mt-8">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis
                        stroke="#9ca3af"
                        tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(value)}
                        width={80}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                        contentStyle={{
                            backgroundColor: 'rgba(31, 41, 55, 0.9)',
                            borderColor: '#4b5563',
                            borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#d1d5db', fontWeight: 'bold' }}
                        formatter={(value: number, name: string) => [`Rp ${value.toLocaleString('id-ID')}`, name]}
                    />
                    <Legend wrapperStyle={{ color: '#d1d5db', paddingTop: '10px' }} />
                    <Bar dataKey="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://picsum.photos/1920/1080?random=1&grayscale&blur=3')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      {/* Full-screen content container */}
      <div className="relative z-10 w-full min-h-screen flex flex-col p-8 sm:p-12 text-white">
        
        {/* Header Section */}
        <header className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-bold tracking-wider">{getPageTitle()}</h1>
          <button
            onClick={onLogout}
            className="py-2 px-5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105"
          >
            Keluar
          </button>
        </header>

        {showSirekap ? (
          <SirekapPage 
            onBack={handleBack} 
            customers={customers}
            setCustomers={setCustomers}
            financeHistory={financeHistory}
            setFinanceHistory={setFinanceHistory}
          />
        ) : showLaporan ? (
          <LaporanBulananPage 
            onBack={handleBack} 
            financeHistory={financeHistory}
          />
        ) : (
          <>
            {/* Menu Section */}
            <div className="mb-8">
              <nav>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  <li>
                    <a 
                      href="#" 
                      onClick={handleSirekapClick}
                      className="text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300 pb-1 border-b-2 border-sky-400">
                      Sirekap
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      onClick={handleLaporanClick}
                      className="text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300 pb-1 border-b-2 border-transparent hover:border-sky-400">
                      Laporan Bulanan
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col justify-center items-center">
              {renderFinancialVisualisation()}
            </main>
          </>
        )}
        
      </div>
    </div>
  );
};

export default DashboardPage;
