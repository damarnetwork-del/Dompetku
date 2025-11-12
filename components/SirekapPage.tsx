import React, { useState } from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

// Declare Swal to inform TypeScript about the global variable from the CDN script
declare const Swal: any;

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

interface SirekapPageProps {
  onBack: () => void;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  financeHistory: FinanceEntry[];
  setFinanceHistory: React.Dispatch<React.SetStateAction<FinanceEntry[]>>;
}



const SirekapPage: React.FC<SirekapPageProps> = ({ onBack, customers, setCustomers, financeHistory, setFinanceHistory }) => {
  const [activeMenu, setActiveMenu] = useState('daftar'); // 'daftar', 'input', 'keuangan', or 'riwayat'
  
  // State for the new customer form
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [jenisLangganan, setJenisLangganan] = useState('PPPoE');
  const [alamat, setAlamat] = useState('');
  const [harga, setHarga] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // State for the new finance form
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kategori, setKategori] = useState('Pemasukan');
  const [metode, setMetode] = useState('Transfer');
  const [nominal, setNominal] = useState('');

  // State for editing finance entry
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);

  // State for filtering and visibility
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenisLangganan, setFilterJenisLangganan] = useState('Semua');
  const [isListVisible, setIsListVisible] = useState(true);

  // State for finance history filtering
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const resetCustomerForm = () => {
    setNama('');
    setNoHp('');
    setJenisLangganan('PPPoE');
    setAlamat('');
    setHarga('');
    setEditingCustomer(null);
  };

  const handleCustomerFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingCustomer) {
        const updatedCustomers = customers.map(c => 
            c.id === editingCustomer.id 
            ? { ...c, nama, noHp, jenisLangganan, alamat, harga: harga || '0' } 
            : c
        );
        setCustomers(updatedCustomers);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data pelanggan berhasil diperbarui.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
    } else {
        const newCustomer: Customer = {
          id: Date.now(),
          nama,
          noHp,
          jenisLangganan,
          alamat,
          harga: harga || '0',
          status: 'Belum Lunas',
          tunggakan: 0,
        };
        setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
        Swal.fire({
          title: 'Berhasil!',
          text: 'Pelanggan baru berhasil ditambahkan.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
    }
    
    resetCustomerForm();
    setActiveMenu('daftar');
    setIsListVisible(true);
  };
  
  const resetFinanceForm = () => {
    setDeskripsi('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setKategori('Pemasukan');
    setMetode('Transfer');
    setNominal('');
    setEditingEntry(null);
  };

  const handleFinanceFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (editingEntry) {
        const updatedHistory = financeHistory.map(entry => 
            entry.id === editingEntry.id 
            ? { ...entry, deskripsi, tanggal, kategori, metode, nominal: Number(nominal) } 
            : entry
        );
        setFinanceHistory(updatedHistory);
        Swal.fire('Berhasil!', 'Catatan keuangan berhasil diperbarui.', 'success');
    } else {
        const newFinanceEntry: FinanceEntry = {
            id: Date.now(),
            deskripsi,
            tanggal,
            kategori,
            metode,
            nominal: Number(nominal),
        };
        setFinanceHistory(prevHistory => [...prevHistory, newFinanceEntry]);
        Swal.fire('Berhasil!', 'Catatan keuangan berhasil ditambahkan.', 'success');
    }

    resetFinanceForm();
    setActiveMenu('riwayat');
  };

  const handleStartEdit = (entry: FinanceEntry) => {
    setEditingEntry(entry);
    setDeskripsi(entry.deskripsi);
    setTanggal(entry.tanggal);
    setKategori(entry.kategori);
    setMetode(entry.metode);
    setNominal(String(entry.nominal));
    setActiveMenu('keuangan');
  };

  const handleDeleteEntry = (id: number) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda tidak akan dapat mengembalikan ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result: any) => {
      if (result.isConfirmed) {
        setFinanceHistory(prevHistory => prevHistory.filter(entry => entry.id !== id));
        Swal.fire(
          'Dihapus!',
          'Catatan keuangan telah dihapus.',
          'success'
        )
      }
    })
  };

  const handleStartEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setNama(customer.nama);
    setNoHp(customer.noHp);
    setJenisLangganan(customer.jenisLangganan);
    setAlamat(customer.alamat);
    setHarga(customer.harga);
    setActiveMenu('input');
  };

  const handleDeleteCustomer = (id: number) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data pelanggan akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result: any) => {
      if (result.isConfirmed) {
        setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== id));
        Swal.fire(
          'Dihapus!',
          'Data pelanggan telah berhasil dihapus.',
          'success'
        )
      }
    })
  };

  const handlePayment = (customer: Customer) => {
      if (customer.status === 'Lunas') return;

      const totalTagihan = Number(customer.harga) + customer.tunggakan;
      
      const newPaymentEntry: FinanceEntry = {
          id: Date.now(),
          deskripsi: `Pembayaran langganan - ${customer.nama}`,
          tanggal: new Date().toISOString().split('T')[0],
          kategori: 'Pemasukan',
          metode: 'Tunai', // Default method, can be updated with a modal
          nominal: totalTagihan,
      };
      setFinanceHistory(prevHistory => [...prevHistory, newPaymentEntry]);

      const updatedCustomers = customers.map(c => 
          c.id === customer.id 
          ? { ...c, status: 'Lunas', tunggakan: 0 } 
          : c
      );
      setCustomers(updatedCustomers);
      
      Swal.fire({
        icon: 'success',
        title: 'Pembayaran Berhasil',
        text: `Pembayaran untuk ${customer.nama} sebesar Rp ${totalTagihan.toLocaleString('id-ID')} berhasil dicatat.`
      });
  };
  
  const handleNewBillingCycle = () => {
    if (customers.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Tidak ada pelanggan untuk memulai siklus tagihan.',
        });
        return;
    }

    Swal.fire({
      title: 'Mulai Siklus Tagihan Baru?',
      text: "Pelanggan yang belum lunas akan diakumulasikan tunggakannya. Lanjutkan?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, mulai!',
      cancelButtonText: 'Batal'
    }).then((result: any) => {
      if (result.isConfirmed) {
        const updatedCustomers = customers.map(c => {
            const newTunggakan = c.status === 'Belum Lunas' ? c.tunggakan + Number(c.harga) : c.tunggakan;
            return {
                ...c,
                // FIX: Use 'as const' to ensure TypeScript infers the literal type 'Belum Lunas' instead of 'string'.
                status: 'Belum Lunas' as const,
                tunggakan: newTunggakan,
            };
        });
        setCustomers(updatedCustomers);
        Swal.fire(
          'Berhasil!',
          'Siklus tagihan baru telah dimulai. Semua status pelanggan direset menjadi "Belum Lunas".',
          'success'
        );
      }
    })
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearchTerm = customer.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJenisLangganan = filterJenisLangganan === 'Semua' || customer.jenisLangganan === filterJenisLangganan;
    return matchesSearchTerm && matchesJenisLangganan;
  });
  
  const filteredFinanceHistory = financeHistory.filter(entry => {
    if (!filterStartDate && !filterEndDate) {
        return true;
    }
    const entryDate = new Date(entry.tanggal);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;

    if(startDate) startDate.setUTCHours(0,0,0,0);
    if(endDate) endDate.setUTCHours(23,59,59,999);
    
    const isAfterStartDate = startDate ? entryDate >= startDate : true;
    const isBeforeEndDate = endDate ? entryDate <= endDate : true;
    
    return isAfterStartDate && isBeforeEndDate;
  });

  const renderCustomerList = () => {
    if (customers.length === 0) {
      return (
        <div className="text-center text-gray-400 mt-8">
          <p>Belum ada data pelanggan yang diinput.</p>
          <p>Silakan tambahkan pelanggan baru melalui menu "Input Pelanggan Baru".</p>
        </div>
      );
    }

    if (filteredCustomers.length === 0) {
      return (
        <div className="text-center text-gray-400 mt-8">
          <p>Tidak ada data pelanggan yang cocok dengan filter Anda.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-white uppercase bg-white/10">
            <tr>
              <th scope="col" className="px-6 py-3">Nama Pelanggan</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Harga (Rp)</th>
              <th scope="col" className="px-6 py-3 text-right">Tunggakan (Rp)</th>
              <th scope="col" className="px-6 py-3 text-right">Total Tagihan (Rp)</th>
              <th scope="col" className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => {
              const totalTagihan = Number(customer.harga) + customer.tunggakan;
              return (
              <tr key={customer.id} className="border-b border-gray-700 hover:bg-white/5">
                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{customer.nama}</th>
                 <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      customer.status === 'Lunas' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                      {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">{Number(customer.harga).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-right">{customer.tunggakan.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-right font-bold">{totalTagihan.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-center space-x-2">
                    <button 
                        onClick={() => handlePayment(customer)} 
                        disabled={customer.status === 'Lunas'}
                        className="font-medium text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors text-xs py-1 px-2 rounded bg-green-500/10 hover:bg-green-500/20 disabled:bg-gray-500/10"
                    >
                        Bayar
                    </button>
                    <button 
                        onClick={() => handleStartEditCustomer(customer)} 
                        className="font-medium text-blue-400 hover:text-blue-300 transition-colors text-xs py-1 px-2 rounded bg-blue-500/10 hover:bg-blue-500/20"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => handleDeleteCustomer(customer.id)} 
                        className="font-medium text-red-400 hover:text-red-300 transition-colors text-xs py-1 px-2 rounded bg-red-500/10 hover:bg-red-500/20"
                    >
                        Hapus
                    </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    );
  }

  const renderFinanceHistory = () => {
    if (financeHistory.length === 0) {
        return (
            <div className="text-center text-gray-400 mt-8">
                <p>Belum ada riwayat transaksi yang tercatat.</p>
                <p>Silakan tambahkan catatan baru melalui menu "Catatan Keuangan".</p>
            </div>
        );
    }
    
    return (
      <>
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white/5 rounded-lg items-center">
            <div className="flex-1 w-full">
                <label htmlFor="filterStartDate" className="block text-sm font-medium text-gray-400 mb-1">Dari Tanggal</label>
                <input
                  type="date"
                  id="filterStartDate"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full pl-4 pr-3 py-2 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300"
                />
            </div>
            <div className="flex-1 w-full">
                <label htmlFor="filterEndDate" className="block text-sm font-medium text-gray-400 mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  id="filterEndDate"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full pl-4 pr-3 py-2 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300"
                />
            </div>
        </div>
        
        {filteredFinanceHistory.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>Tidak ada data transaksi yang cocok dengan filter tanggal Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-300">
                  <thead className="text-xs text-white uppercase bg-white/10">
                      <tr>
                          <th scope="col" className="px-6 py-3">Tanggal</th>
                          <th scope="col" className="px-6 py-3">Deskripsi</th>
                          <th scope="col" className="px-6 py-3">Kategori</th>
                          <th scope="col" className="px-6 py-3">Metode</th>
                          <th scope="col" className="px-6 py-3 text-right">Nominal (Rp)</th>
                          <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredFinanceHistory.map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-700 hover:bg-white/5">
                              <td className="px-6 py-4">{new Date(entry.tanggal).toLocaleDateString('id-ID', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })}</td>
                              <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{entry.deskripsi}</th>
                              <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      entry.kategori === 'Pemasukan' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                  }`}>
                                      {entry.kategori}
                                  </span>
                              </td>
                              <td className="px-6 py-4">{entry.metode}</td>
                              <td className={`px-6 py-4 text-right font-semibold ${entry.kategori === 'Pemasukan' ? 'text-green-400' : 'text-red-400'}`}>
                                  {entry.kategori === 'Pemasukan' ? '+' : '-'} {entry.nominal.toLocaleString('id-ID')}
                              </td>
                              <td className="px-6 py-4 text-center space-x-4">
                                <button onClick={() => handleStartEdit(entry)} className="font-medium text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                                <button onClick={() => handleDeleteEntry(entry.id)} className="font-medium text-red-400 hover:text-red-300 transition-colors">Hapus</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        )}
      </>
    );
  }

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

      {/* Menu Section */}
      <div className="mb-8">
        <nav>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <button
                onClick={() => setActiveMenu('daftar')}
                className={`text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300 pb-1 ${
                  activeMenu === 'daftar' ? 'border-b-2 border-sky-400' : 'border-b-2 border-transparent'
                }`}>
                Daftar Pelanggan
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  if (editingCustomer) resetCustomerForm();
                  setActiveMenu('input');
                }}
                className={`text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300 pb-1 ${
                  activeMenu === 'input' ? 'border-b-2 border-sky-400' : 'border-b-2 border-transparent'
                }`}>
                Input Pelanggan Baru
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  if (editingEntry) setEditingEntry(null); // Reset if switching away from edit
                  setActiveMenu('keuangan');
                }}
                className={`text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300 pb-1 ${
                  activeMenu === 'keuangan' ? 'border-b-2 border-sky-400' : 'border-b-2 border-transparent'
                }`}>
                Catatan Keuangan
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveMenu('riwayat')}
                className={`text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300 pb-1 ${
                  activeMenu === 'riwayat' ? 'border-b-2 border-sky-400' : 'border-b-2 border-transparent'
                }`}>
                Riwayat Transaksi
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <main className="flex-grow flex flex-col bg-black/20 rounded-lg p-6 sm:p-8">
        {activeMenu === 'daftar' && (
          <div>
            <h2 className="text-3xl font-semibold mb-6 text-center">Rekap Daftar Pelanggan</h2>
            
            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 p-4 bg-white/5 rounded-lg items-center">
              <input
                type="text"
                placeholder="Cari berdasarkan nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow w-full sm:w-auto pl-4 pr-3 py-2 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300 placeholder-gray-400"
              />
              <select
                value={filterJenisLangganan}
                onChange={(e) => setFilterJenisLangganan(e.target.value)}
                className="w-full sm:w-auto pl-3 pr-8 py-2 text-white bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300"
              >
                <option value="Semua" className="bg-gray-800">Semua Jenis</option>
                <option value="PPPoE" className="bg-gray-800">PPPoE</option>
                <option value="Static" className="bg-gray-800">Static</option>
                <option value="Hotspot" className="bg-gray-800">Hotspot</option>
                <option value="Mitra Voucher" className="bg-gray-800">Mitra Voucher</option>
              </select>
              <button
                onClick={() => setIsListVisible(!isListVisible)}
                className="w-full sm:w-auto py-2 px-5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 transition-colors"
              >
                {isListVisible ? 'Sembunyikan Daftar' : 'Tampilkan Daftar'}
              </button>
               <button
                  onClick={handleNewBillingCycle}
                  className="w-full sm:w-auto py-2 px-5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
                >
                  Mulai Siklus Tagihan Baru
                </button>
            </div>
            
            {isListVisible && renderCustomerList()}

          </div>
        )}
        {activeMenu === 'input' && (
          <div>
            <h2 className="text-3xl font-semibold mb-6 text-center">{editingCustomer ? 'Edit Data Pelanggan' : 'Formulir Pelanggan Baru'}</h2>
            <form onSubmit={handleCustomerFormSubmit} className="space-y-4 max-w-xl mx-auto">
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-300 mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  className="w-full pl-4 pr-3 py-2 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300 placeholder-gray-400"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label htmlFor="noHp" className="block text-sm font-medium text-gray-300 mb-1">No Handphone</label>
                <input
                  type="tel"
                  id="noHp"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  required
                  className="w-full pl-4 pr-3 py-2 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300 placeholder-gray-400"
                  placeholder="Contoh: 08123456789"
                />
              </div>
              <div>
                <label htmlFor="jenisLangganan" className="block text-sm font-medium text-gray-300 mb-1">Jenis Langganan</label>
                <select
                  id="jenisLangganan"
                  value={jenisLangganan}
                  onChange={(e) => setJenisLangganan(e.target.value)}
                  required
                  className="w-full pl-3 pr-3 py-2 text-white bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300"
                >
                  <option value="PPPoE" className="bg-gray-800">PPPoE</option>
                  <option value="Static" className="bg-gray-800">Static</option>
                  <option value="Hotspot" className="bg-gray-800">Hotspot</option>
                  <option value="Mitra Voucher" className="bg-gray-800">Mitra Voucher</option>
                </select>
              </div>
              <div>
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-300 mb-1">Alamat</label>
                <textarea
                  id="alamat"
                  rows={3}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  required
                  className="w-full pl-4 pr-3 py-2 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300 placeholder-gray-400"
                  placeholder="Masukkan alamat lengkap pelanggan"
                />
              </div>
              <div>
                <label htmlFor="harga" className="block text-sm font-medium text-gray-300 mb-1">Harga Langganan (Rp)</label>
                <input
                  type="number"
                  id="harga"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  required
                  className="w-full pl-4 pr-3 py-2 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300 placeholder-gray-400"
                  placeholder="Contoh: 150000"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-transform transform hover:scale-105"
                >
                  {editingCustomer ? 'Update Pelanggan' : 'Simpan Pelanggan'}
                </button>
                 {editingCustomer && (
                  <button
                    type="button"
                    onClick={resetCustomerForm}
                    className="w-full flex justify-center mt-3 py-2 px-4 border border-gray-500 rounded-lg shadow-sm text-sm font-medium text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        {activeMenu === 'keuangan' && (
          <div>
            <h2 className="text-3xl font-semibold mb-6 text-center">{editingEntry ? 'Edit Catatan Keuangan' : 'Formulir Catatan Keuangan'}</h2>
            <form onSubmit={handleFinanceFormSubmit} className="space-y-4 max-w-xl mx-auto">
              <div>
                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-300 mb-1">Deskripsi</label>
                <textarea
                  id="deskripsi"
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  required
                  className="w-full pl-4 pr-3 py-2 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300 placeholder-gray-400"
                  placeholder="Contoh: Pembelian router baru"
                />
              </div>
               <div>
                <label htmlFor="tanggal" className="block text-sm font-medium text-gray-300 mb-1">Tanggal</label>
                <input
                  type="date"
                  id="tanggal"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                  className="w-full pl-4 pr-3 py-2 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300 placeholder-gray-400"
                />
              </div>
              <div>
                <label htmlFor="kategori" className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                <select
                  id="kategori"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  required
                  className="w-full pl-3 pr-3 py-2 text-white bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300"
                >
                  <option value="Pemasukan" className="bg-gray-800">Pemasukan</option>
                  <option value="Pengeluaran" className="bg-gray-800">Pengeluaran</option>
                </select>
              </div>
              <div>
                <label htmlFor="metode" className="block text-sm font-medium text-gray-300 mb-1">Metode Pembayaran</label>
                <select
                  id="metode"
                  value={metode}
                  onChange={(e) => setMetode(e.target.value)}
                  required
                  className="w-full pl-3 pr-3 py-2 text-white bg-gray-800/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300"
                >
                  <option value="Transfer" className="bg-gray-800">Transfer</option>
                  <option value="Tunai" className="bg-gray-800">Tunai</option>
                </select>
              </div>
              <div>
                <label htmlFor="nominal" className="block text-sm font-medium text-gray-300 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  id="nominal"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  required
                  className="w-full pl-4 pr-3 py-2 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition duration-300 placeholder-gray-400"
                  placeholder="Contoh: 500000"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-transform transform hover:scale-105"
                >
                  {editingEntry ? 'Update Catatan' : 'Simpan Catatan'}
                </button>
                {editingEntry && (
                  <button
                    type="button"
                    onClick={resetFinanceForm}
                    className="w-full flex justify-center mt-3 py-2 px-4 border border-gray-500 rounded-lg shadow-sm text-sm font-medium text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        {activeMenu === 'riwayat' && (
          <div>
            <h2 className="text-3xl font-semibold mb-6 text-center">Riwayat Transaksi Keuangan</h2>
            {renderFinanceHistory()}
          </div>
        )}
      </main>
    </div>
  );
};

export default SirekapPage;
