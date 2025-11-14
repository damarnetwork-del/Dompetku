
import React, { useState } from 'react';
import UserIcon from './icons/UserIcon';
import LockIcon from './icons/LockIcon';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';
import NetworkIcon from './icons/NetworkIcon';
import SpinnerIcon from './icons/SpinnerIcon';


interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
      if (username === 'admin' && password === 'damar') {
        onLoginSuccess(username);
      } else {
        setError('Username atau kata sandi salah.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
    >
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 animate-fade-in-slide-up">
        <div className="text-center">
          <NetworkIcon className="w-16 h-16 mx-auto mb-4 text-sky-400" />
          <h1 className="text-4xl font-bold text-white tracking-wider">Selamat Datang</h1>
          <p className="mt-2 text-gray-300">Masuk untuk melanjutkan ke dasbor Anda</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-center text-sm text-red-400 bg-red-500/20 py-2 rounded-lg animate-error">{error}</p>}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <UserIcon className="w-5 h-5 text-gray-300" />
            </div>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-3 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition duration-300 placeholder-gray-400"
              placeholder="Masukkan Username Anda"
              autoComplete="username"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LockIcon className="w-5 h-5 text-gray-300" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-3 text-white bg-white/10 border border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:outline-none transition duration-300 placeholder-gray-400"
              placeholder="Masukkan Kata Sandi Anda"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300 hover:text-white"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="remember-me" className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-sky-500 bg-gray-700 border-gray-600 rounded focus:ring-sky-600"/>
              <span className="ml-2 text-sm text-gray-300">Ingat saya</span>
            </label>
            <div className="text-sm">
              <a href="#" className="font-medium text-sky-400 hover:text-sky-300">
                Lupa kata sandi?
              </a>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-5 h-5" />
                  <span>Memproses...</span>
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-400">
          Belum punya akun?{' '}
          <a href="#" className="font-medium text-sky-400 hover:text-sky-300">
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
