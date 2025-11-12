
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
    </div>
  );
}

export default App;
