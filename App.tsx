
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage, { CompanyInfo } from './components/DashboardPage';

const COMPANY_INFO_KEY = 'sidompet_companyInfo';

const defaultCompanyInfo: CompanyInfo = {
    name: 'Damar Global Network',
    address: 'Jl. Internet Cepat No. 42, Jakarta',
    phone: '021-555-0123',
    logo: null,
    waGatewayUrl: '',
    waGatewayToken: '',
    namaBank: '',
    nomorRekening: '',
    atasNama: '',
};


function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    try {
        const saved = localStorage.getItem(COMPANY_INFO_KEY);
        if (saved) {
            // Gabungkan data yang disimpan dengan default untuk menangani pembaruan skema dengan baik
            const parsed = JSON.parse(saved);
            return { ...defaultCompanyInfo, ...parsed };
        }
    } catch (error) {
        console.error("Gagal memuat info perusahaan dari localStorage, kembali ke default.", error);
        // Jangan hapus item, mungkin bisa dipulihkan. Cukup gunakan default untuk sesi ini.
    }
    return defaultCompanyInfo;
  });

  useEffect(() => {
    try {
        localStorage.setItem(COMPANY_INFO_KEY, JSON.stringify(companyInfo));
    } catch (error) {
        console.error("Gagal menyimpan info perusahaan ke localStorage", error);
    }
  }, [companyInfo]);

  const handleLoginSuccess = (username: string) => {
    setLoggedInUser(username);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  return (
    <div className="min-h-screen">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="video-bg"
        poster="https://picsum.photos/1920/1080?random=3&grayscale&blur=3"
      >
        <source src="https://cdn.coverr.co/videos/coverr-a-futuristic-digital-scene-6242/1080p.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
      
      <div className="relative">
        {loggedInUser ? (
          <DashboardPage
            onLogout={handleLogout}
            username={loggedInUser}
            companyInfo={companyInfo}
            setCompanyInfo={setCompanyInfo}
          />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-gray-400 text-sm bg-gray-900/50 backdrop-blur-sm z-50">
        Hak Cipta © {new Date().getFullYear()} {companyInfo.name}. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}

export default App;
