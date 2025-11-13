
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
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error("Gagal memuat info perusahaan dari localStorage", error);
        localStorage.removeItem(COMPANY_INFO_KEY);
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
    <div className="min-h-screen bg-gray-900">
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
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-gray-400 text-sm bg-gray-900/50 backdrop-blur-sm z-50">
        Hak Cipta © {new Date().getFullYear()} {companyInfo.name}. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}

export default App;
