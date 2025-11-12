
import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';

function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  const handleLoginSuccess = (username: string) => {
    setLoggedInUser(username);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {loggedInUser ? (
        <DashboardPage onLogout={handleLogout} username={loggedInUser} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-gray-400 text-sm bg-gray-900/50 backdrop-blur-sm z-50">
        Hak Cipta © {new Date().getFullYear()} Sidompet Inc. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}

export default App;
