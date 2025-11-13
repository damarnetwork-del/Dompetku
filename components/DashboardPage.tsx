
import React, { useState, useEffect } from 'react';
import SirekapPage from './SirekapPage';
import LaporanBulananPage from './LaporanBulananPage';
import InvoicePage from './InvoicePage'; // Import the new InvoicePage
// FIX: Import ProfitShare to break circular dependency
import { ProfitShare } from './LaporanBulananPage';
import * as Recharts from 'recharts';
import SettingsIcon from './icons/SettingsIcon';

// Declare Swal to inform TypeScript about the global variable from the CDN script
declare const Swal: any;

// Destructure components from the Recharts namespace
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } = Recharts;


interface DashboardPageProps {
  onLogout: () => void;
  username: string;
  companyInfo: CompanyInfo;
  setCompanyInfo: React.Dispatch<React.SetStateAction<CompanyInfo>>;
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

export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    logo: string | null;
    waGatewayUrl: string;
    waGatewayToken: string;
    namaBank: string;
    nomorRekening: string;
    atasNama: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout, username, companyInfo, setCompanyInfo }) => {
  const [showSirekap, setShowSirekap] = useState(false);
  const [showLaporan, setShowLaporan] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false); // State for invoice page

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
        const saved = localStorage.getItem('sidompet_customers');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Gagal memuat data pelanggan dari penyimpanan:", e);
        return [];
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem('sidompet_customers', JSON.stringify(customers));
    } catch (e) {
        console.error("Gagal menyimpan data pelanggan:", e);
    }
  }, [customers]);

  const [financeHistory, setFinanceHistory] = useState<FinanceEntry[]>(() => {
      try {
          const saved = localStorage.getItem('sidompet_financeHistory');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          console.error("Gagal memuat riwayat keuangan dari penyimpanan:", e);
          return [];
      }
  });

  useEffect(() => {
      try {
          localStorage.setItem('sidompet_financeHistory', JSON.stringify(financeHistory));
      } catch (e) {
          console.error("Gagal menyimpan riwayat keuangan:", e);
      }
  }, [financeHistory]);

  const [profitSharingData, setProfitSharingData] = useState<ProfitShare[]>(() => {
    try {
        const saved = localStorage.getItem('sidompet_profitSharing');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Gagal memuat data bagi hasil dari penyimpanan:", e);
        return [];
    }
  });

  useEffect(() => {
      try {
          localStorage.setItem('sidompet_profitSharing', JSON.stringify(profitSharingData));
      } catch (e) {
          console.error("Gagal menyimpan data bagi hasil:", e);
      }
  }, [profitSharingData]);

  const handlePaymentNotification = async (customer: { nama: string; noHp: string; }, amount: number) => {
    if (!companyInfo.waGatewayUrl || !companyInfo.waGatewayToken) {
      console.log("WhatsApp gateway not configured. Skipping payment confirmation notification.");
      return;
    }

    let formattedPhone = customer.noHp.trim();
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.substring(1);
    }
    formattedPhone = formattedPhone.replace(/\D/g, '');

    const message = `Yth. Bpk/Ibu ${customer.nama},\n\nTerima kasih. Pembayaran Anda sebesar *Rp ${amount.toLocaleString('id-ID')}* telah berhasil kami terima.\n\nSalam,\n${companyInfo.name}`;

    try {
      // Assuming a generic API structure for the gateway
      const response = await fetch(companyInfo.waGatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: companyInfo.waGatewayToken,
          to: formattedPhone,
          body: message,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`WhatsApp API request failed with status ${response.status}: ${errorBody}`);
      }
      
      const result = await response.json();
      console.log('WhatsApp payment confirmation sent successfully:', result);

    } catch (error) {
      console.error('Failed to send WhatsApp payment confirmation:', error);
      // We don't show an error to the user to keep the UX smooth,
      // as the primary action (payment recording) was successful.
    }
  };
    
  const handleBackup = (type: 'all' | 'data') => {
    let backupData: any = {};
    let fileName = `sidompet_backup_${type}`;

    if (type === 'all') {
        backupData = {
            companyInfo,
            customers,
            financeHistory,
        };
    } else {
        backupData = {
            customers,
            financeHistory,
        };
    }

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `${fileName}_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Swal.fire({
        title: 'Backup Berhasil',
        text: `File ${link.download} telah diunduh.`,
        icon: 'success',
        customClass: {
            popup: '!bg-gray-800 !text-white !rounded-lg',
            title: '!text-white',
            confirmButton: '!bg-blue-600 hover:!bg-blue-700',
        }
    });
  };
    
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result as string;
            const parsedData = JSON.parse(text);

            if (!parsedData.customers || !parsedData.financeHistory) {
                throw new Error('File backup tidak valid: data pelanggan atau transaksi tidak ditemukan.');
            }

            Swal.fire({
                title: 'Konfirmasi Restore Data',
                text: "Anda yakin ingin menimpa semua data saat ini dengan data dari file backup? Tindakan ini tidak dapat diurungkan.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Ya, restore!',
                cancelButtonText: 'Batal',
                customClass: {
                    popup: '!bg-gray-800 !text-white !rounded-lg',
                    title: '!text-white',
                    confirmButton: '!bg-red-600 hover:!bg-red-700',
                    cancelButton: '!bg-gray-600 hover:!bg-gray-700',
                },
            }).then((result: any) => {
                if (result.isConfirmed) {
                    if (parsedData.companyInfo) {
                        setCompanyInfo(parsedData.companyInfo);
                    }
                    setCustomers(parsedData.customers);
                    setFinanceHistory(parsedData.financeHistory);
                    
                    Swal.fire({
                        title: 'Restore Berhasil!',
                        text: 'Data telah berhasil dipulihkan dari file backup.',
                        icon: 'success',
                        customClass: {
                          popup: '!bg-gray-800 !text-white !rounded-lg',
                          title: '!text-white',
                          confirmButton: '!bg-blue-600 hover:!bg-blue-700',
                        }
                    });
                }
            });
        } catch (error: any) {
            Swal.fire({
                title: 'Restore Gagal',
                text: `Terjadi kesalahan saat membaca file backup: ${error.message}`,
                icon: 'error',
                customClass: {
                    popup: '!bg-gray-800 !text-white !rounded-lg',
                    title: '!text-white',
                    confirmButton: '!bg-red-600 hover:!bg-red-700',
                },
            });
        } finally {
            // Reset the file input so the same file can be selected again
            event.target.value = '';
        }
    };
    reader.readAsText(file);
  }

  const handleSettingsClick = () => {
    Swal.fire({
      title: 'Pengaturan Aplikasi',
      html: `
        <div class="text-left space-y-4 p-4 text-gray-300">
          <h3 class="text-lg font-semibold text-sky-400 border-b border-gray-600 pb-2">Informasi Perusahaan</h3>
          <div>
            <label for="swal-company-name" class="block text-sm font-medium mb-1">Nama Perusahaan</label>
            <input id="swal-company-name" class="swal2-input w-full !bg-gray-700 !border-gray-600 !text-white" value="${companyInfo.name}" placeholder="Nama Perusahaan Anda">
          </div>
          <div>
            <label for="swal-company-address" class="block text-sm font-medium mb-1">Alamat</label>
            <textarea id="swal-company-address" class="swal2-textarea w-full !bg-gray-700 !border-gray-600 !text-white" placeholder="Alamat Perusahaan">${companyInfo.address}</textarea>
          </div>
          <div>
            <label for="swal-company-phone" class="block text-sm font-medium mb-1">No. Telepon</label>
            <input id="swal-company-phone" type="tel" class="swal2-input w-full !bg-gray-700 !border-gray-600 !text-white" value="${companyInfo.phone}" placeholder="Nomor Telepon">
          </div>
           <div>
            <label for="swal-company-logo" class="block text-sm font-medium mb-1">Logo Perusahaan</label>
            <div class="flex items-center gap-4">
              <img id="swal-logo-preview" src="${companyInfo.logo || 'https://via.placeholder.com/150/1f2937/FFFFFF?text=Logo'}" alt="Logo Preview" class="h-20 w-20 object-contain rounded-md bg-gray-700"/>
              <input id="swal-company-logo" type="file" accept="image/*" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-600/30 cursor-pointer">
            </div>
          </div>

          <h3 class="text-lg font-semibold text-sky-400 border-b border-gray-600 pb-2 pt-4">Informasi Pembayaran</h3>
          <div>
            <label for="swal-bank-name" class="block text-sm font-medium mb-1">Nama Bank</label>
            <input id="swal-bank-name" class="swal2-input w-full !bg-gray-700 !border-gray-600 !text-white" value="${companyInfo.namaBank || ''}" placeholder="cth: Bank Central Asia">
          </div>
          <div>
            <label for="swal-account-number" class="block text-sm font-medium mb-1">Nomor Rekening</label>
            <input id="swal-account-number" class="swal2-input w-full !bg-gray-700 !border-gray-600 !text-white" value="${companyInfo.nomorRekening || ''}" placeholder="cth: 1234567890">
          </div>
          <div>
            <label for="swal-account-name" class="block text-sm font-medium mb-1">Atas Nama</label>
            <input id="swal-account-name" class="swal2-input w-full !bg-gray-700 !border-gray-600 !text-white" value="${companyInfo.atasNama || ''}" placeholder="cth: PT. Sidompet Sejahtera">
          </div>
          
          <h3 class="text-lg font-semibold text-sky-400 border-b border-gray-600 pb-2 pt-4">Integrasi Gateway</h3>
          <div>
            <label for="swal-wa-url" class="block text-sm font-medium mb-1">URL Gateway WhatsApp</label>
            <input id="swal-wa-url" type="url" class="swal2-input w-full !bg-gray-700 !border-gray-600 !text-white" value="${companyInfo.waGatewayUrl || ''}" placeholder="cth: https://api.wa-gateway.com/send">
          </div>
          <div>
            <label for="swal-wa-token" class="block text-sm font-medium mb-1">Token API Gateway</label>
            <input id="swal-wa-token" type="text" class="swal2-input w-full !bg-gray-700 !border-gray-600 !text-white" value="${companyInfo.waGatewayToken || ''}" placeholder="Token atau Kunci API Anda">
          </div>

          <h3 class="text-lg font-semibold text-sky-400 border-b border-gray-600 pb-2 pt-4">Backup & Restore</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-2">Backup Data</label>
              <div class="flex flex-col sm:flex-row gap-2">
                <button id="swal-backup-all" class="swal2-styled w-full !bg-green-600 hover:!bg-green-700">Backup Semua Pengaturan & Data</button>
                <button id="swal-backup-data" class="swal2-styled w-full !bg-green-800 hover:!bg-green-900">Backup Data Pelanggan & Transaksi</button>
              </div>
            </div>
            <div>
              <label for="swal-restore-file" class="block text-sm font-medium mb-2">Restore Data dari File</label>
               <input id="swal-restore-file" type="file" accept=".json" class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500/20 file:text-yellow-300 hover:file:bg-yellow-600/30 cursor-pointer">
               <p class="text-xs text-gray-500 mt-1">Pilih file backup (.json) untuk memulihkan data. Ini akan menimpa data yang ada.</p>
            </div>
          </div>
        </div>
      `,
      width: '48rem',
      customClass: {
          popup: '!bg-gray-800 !text-white !rounded-lg',
          title: '!text-white',
          htmlContainer: '!text-white',
          confirmButton: '!bg-blue-600 hover:!bg-blue-700',
          cancelButton: '!bg-gray-600 hover:!bg-gray-700',
      },
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      didOpen: () => {
        const logoInput = document.getElementById('swal-company-logo') as HTMLInputElement;
        const logoPreview = document.getElementById('swal-logo-preview') as HTMLImageElement;
        logoInput.onchange = () => {
          const file = logoInput.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              logoPreview.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
          }
        };

        // Attach backup/restore event listeners
        const backupAllBtn = document.getElementById('swal-backup-all');
        if (backupAllBtn) backupAllBtn.onclick = () => handleBackup('all');
        
        const backupDataBtn = document.getElementById('swal-backup-data');
        if (backupDataBtn) backupDataBtn.onclick = () => handleBackup('data');

        const restoreInput = document.getElementById('swal-restore-file') as HTMLInputElement;
        if (restoreInput) restoreInput.onchange = (e) => handleRestore(e as any);
      },
      preConfirm: () => {
        const name = (document.getElementById('swal-company-name') as HTMLInputElement).value;
        const address = (document.getElementById('swal-company-address') as HTMLTextAreaElement).value;
        const phone = (document.getElementById('swal-company-phone') as HTMLInputElement).value;
        const waGatewayUrl = (document.getElementById('swal-wa-url') as HTMLInputElement).value;
        const waGatewayToken = (document.getElementById('swal-wa-token') as HTMLInputElement).value;
        const namaBank = (document.getElementById('swal-bank-name') as HTMLInputElement).value;
        const nomorRekening = (document.getElementById('swal-account-number') as HTMLInputElement).value;
        const atasNama = (document.getElementById('swal-account-name') as HTMLInputElement).value;
        const logoInput = document.getElementById('swal-company-logo') as HTMLInputElement;
        const logoFile = logoInput.files?.[0];

        return new Promise((resolve) => {
          if (logoFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                name,
                address,
                phone,
                waGatewayUrl,
                waGatewayToken,
                namaBank,
                nomorRekening,
                atasNama,
                logo: e.target?.result as string
              });
            };
            reader.readAsDataURL(logoFile);
          } else {
            resolve({
              name,
              address,
              phone,
              waGatewayUrl,
              waGatewayToken,
              namaBank,
              nomorRekening,
              atasNama,
              logo: companyInfo.logo // Keep old logo if no new one is selected
            });
          }
        });
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        setCompanyInfo(result.value as CompanyInfo);
        Swal.fire({
            title: 'Berhasil!',
            text: 'Pengaturan perusahaan telah diperbarui.',
            icon: 'success',
            customClass: {
              popup: '!bg-gray-800 !text-white !rounded-lg',
              title: '!text-white',
              confirmButton: '!bg-blue-600 hover:!bg-blue-700',
            }
        });
      }
    });
  };

  const handleSirekapClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowSirekap(true);
    setShowLaporan(false);
    setShowInvoice(false);
  };

  const handleLaporanClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowLaporan(true);
    setShowSirekap(false);
    setShowInvoice(false);
  };

  const handleInvoiceClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowInvoice(true);
    setShowLaporan(false);
    setShowSirekap(false);
  };

  const handleBack = () => {
    setShowSirekap(false);
    setShowLaporan(false);
    setShowInvoice(false);
  };
  
  const getPageTitle = () => {
    if (showSirekap) return 'Sirekap';
    if (showLaporan) return 'Laporan Bulanan';
    if (showInvoice) return 'Invoice';
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

    // --- New Categorized Data Processing ---

    const getCategory = (entry: FinanceEntry): string => {
        const desc = entry.deskripsi.toLowerCase();
        if (entry.kategori === 'Pemasukan') {
            if (desc.includes('langganan')) return 'Pendapatan Langganan';
            if (desc.includes('pemasangan')) return 'Pendapatan Pemasangan';
            return 'Pemasukan Lainnya';
        } else { // Pengeluaran
            if (desc.includes('router') || desc.includes('alat')) return 'Belanja Modal';
            if (desc.includes('listrik') || desc.includes('gaji')) return 'Biaya Operasional';
            if (desc.includes('bagi hasil')) return 'Bagi Hasil';
            return 'Pengeluaran Lainnya';
        }
    };

    const dailyDataCategorized: { [key: string]: { [category: string]: number } } = {};
    const allIncomeCategories = new Set<string>();
    const allExpenseCategories = new Set<string>();

    financeHistory.forEach(entry => {
        const date = entry.tanggal;
        const category = getCategory(entry);

        if (entry.kategori === 'Pemasukan') {
            allIncomeCategories.add(category);
        } else {
            allExpenseCategories.add(category);
        }

        if (!dailyDataCategorized[date]) {
            dailyDataCategorized[date] = {};
        }

        if (!dailyDataCategorized[date][category]) {
            dailyDataCategorized[date][category] = 0;
        }
        dailyDataCategorized[date][category] += entry.nominal;
    });

    let cumulativeBalance = 0;
    const allCategories = [...allIncomeCategories, ...allExpenseCategories];

    const chartData = Object.keys(dailyDataCategorized)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map(date => {
            const dayData = dailyDataCategorized[date];
            let dailyIncome = 0;
            let dailyExpense = 0;

            const chartEntry: { [key: string]: any } = {
                date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
            };

            allCategories.forEach(cat => {
                const value = dayData[cat] || 0;
                chartEntry[cat] = value;
                if (allIncomeCategories.has(cat)) {
                    dailyIncome += value;
                } else {
                    dailyExpense += value;
                }
            });

            cumulativeBalance += dailyIncome - dailyExpense;
            chartEntry.Saldo = cumulativeBalance;

            return chartEntry;
        });
    
    const categoryColors: { [key: string]: string } = {
        'Pendapatan Langganan': '#22c55e',
        'Pendapatan Pemasangan': '#4ade80',
        'Pemasukan Lainnya': '#86efac',
        'Belanja Modal': '#ef4444',
        'Biaya Operasional': '#f87171',
        'Bagi Hasil': '#fca5a5',
        'Pengeluaran Lainnya': '#fecaca',
    };

    const formatYAxis = (value: number) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(value);

    return (
       <div className="bg-black/20 rounded-lg p-4 sm:p-8 w-full flex-grow">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Ringkasan Keuangan</h2>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
              <div className="bg-green-500/10 p-4 rounded-lg">
                  <p className="text-sm text-green-400 font-semibold">Total Pemasukan</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-red-500/10 p-4 rounded-lg">
                  <p className="text-sm text-red-400 font-semibold">Total Pengeluaran</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-sky-500/10 p-4 rounded-lg">
                  <p className="text-sm text-sky-400 font-semibold">Saldo Akhir</p>
                  <p className={`text-xl sm:text-2xl font-bold ${saldoAkhir >= 0 ? 'text-white' : 'text-red-400'}`}>
                    Rp {saldoAkhir.toLocaleString('id-ID')}
                  </p>
              </div>
          </div>

          {/* New Recharts Composed Chart with Stacked Bars */}
          <div className="w-full h-72 sm:h-80 mt-8">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 5,
                        left: 5,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                    <YAxis 
                        yAxisId="left" 
                        orientation="left" 
                        stroke="#9ca3af"
                        tickFormatter={formatYAxis}
                        width={45}
                        tick={{ fontSize: 10 }}
                    />
                     <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#38bdf8"
                        tickFormatter={formatYAxis}
                        width={45}
                        tick={{ fontSize: 10 }}
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
                    <Legend wrapperStyle={{ color: '#d1d5db', paddingTop: '10px', fontSize: '12px' }} />
                    
                    {Array.from(allIncomeCategories).map(cat => (
                        <Bar key={cat} yAxisId="left" dataKey={cat} stackId="pemasukan" fill={categoryColors[cat] || '#22c55e'} />
                    ))}

                    {Array.from(allExpenseCategories).map(cat => (
                        <Bar key={cat} yAxisId="left" dataKey={cat} stackId="pengeluaran" fill={categoryColors[cat] || '#ef4444'} />
                    ))}

                    <Line yAxisId="right" type="monotone" dataKey="Saldo" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://picsum.photos/1920/1000?random=1&grayscale&blur=3')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      {/* Full-screen content container */}
      <div className="relative z-10 w-full min-h-screen flex flex-col p-4 sm:p-8 text-white">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-4">
            {companyInfo.logo && <img src={companyInfo.logo} alt="Company Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-wider">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-2 self-end">
            <button
              onClick={handleSettingsClick}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Pengaturan"
              title="Pengaturan"
            >
              <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
            </button>
            <button
              onClick={onLogout}
              className="py-2 px-5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105"
            >
              Keluar
            </button>
          </div>
        </header>

        {showSirekap ? (
          <SirekapPage 
            onBack={handleBack} 
            customers={customers}
            setCustomers={setCustomers}
            financeHistory={financeHistory}
            setFinanceHistory={setFinanceHistory}
            onPaymentSuccess={handlePaymentNotification}
            companyInfo={companyInfo}
          />
        ) : showLaporan ? (
          <LaporanBulananPage 
            onBack={handleBack} 
            financeHistory={financeHistory}
            companyInfo={companyInfo}
            profitSharingData={profitSharingData}
            setFinanceHistory={setFinanceHistory}
            setProfitSharingData={setProfitSharingData}
          />
        ) : showInvoice ? (
          <InvoicePage
            onBack={handleBack}
            companyInfo={companyInfo}
          />
        ) : (
          <>
            {/* Menu Section */}
            <div className="mb-8 overflow-x-auto">
              <nav>
                <ul className="flex flex-nowrap sm:flex-wrap gap-x-4 sm:gap-x-6 gap-y-2">
                  <li>
                    <a 
                      href="#" 
                      onClick={handleSirekapClick}
                      className="text-base sm:text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300 pb-1 border-b-2 border-transparent hover:border-sky-400 whitespace-nowrap">
                      Sirekap
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      onClick={handleLaporanClick}
                      className="text-base sm:text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300 pb-1 border-b-2 border-transparent hover:border-sky-400 whitespace-nowrap">
                      Laporan Bulanan
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      onClick={handleInvoiceClick}
                      className="text-base sm:text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300 pb-1 border-b-2 border-transparent hover:border-sky-400 whitespace-nowrap">
                      Invoice
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
