import { useState, useEffect } from 'react'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { Toaster, toast } from 'react-hot-toast'
import Login from './pages/Login/Login'
import SignUp from './pages/SignUp/SignUp'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import Dashboard from './pages/Dashboard/Dashboard'
import ClientCommands from './pages/ClientCommands/ClientCommands'
import Negotiations from './pages/Negotiations/Negotiations'
import MyOffers from './pages/MyOffers/MyOffers'
import Onboarding from './pages/Onboarding/Onboarding'
import Orders from './pages/Orders/Orders'
import Wallet from './pages/Wallet/Wallet'
import Settings from './pages/Settings/Settings'
import PendingBanner from './components/PendingBanner/PendingBanner'


import authService from './api/authService'

function AppContent() {
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('currentPage');
    const token = localStorage.getItem('token');
    if (!token) return 'onboarding';
    return savedPage || 'dashboard';
  });

  const { dir, language, t } = useLanguage();
  
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [vStatus, setVStatus] = useState(() => {
    let status = localStorage.getItem('verificationStatus') || JSON.parse(localStorage.getItem('user') || '{}').status;
    if (status === 'undefined' || status === 'null') return null;
    return status;
  });

  const isPending = (vStatus && vStatus.toLowerCase() === 'pending') || (user.userId && !vStatus);

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    const syncProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          const freshUser = profile.data || profile;
          
          // Check various possible locations for the status depending on the API structure
          const freshStatus = freshUser.verificationStatus || freshUser.status || freshUser.profileVerificationStatus;
          
          console.log('Background profile sync:', freshUser, 'Status found:', freshStatus);
          
          setUser(freshUser);
          if (freshStatus) {
            setVStatus(freshStatus);
            localStorage.setItem('verificationStatus', freshStatus);
          }
          
          localStorage.setItem('user', JSON.stringify(freshUser));
          
        } catch (err) {
          console.error('Background profile sync failed', err);
        }
      }
    };
    syncProfile();
  }, []);

  return (
    <div className="app" dir={dir} lang={language}>
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            duration: 4000,
            style: {
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #34d399',
              padding: '16px 24px',
              borderRadius: '12px',
              fontWeight: '600',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #f87171',
              padding: '16px 24px',
              borderRadius: '12px',
              fontWeight: '600',
            },
          }
        }}
      />
      {currentPage === 'onboarding' && (
        <Onboarding onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'login' && (
        <Login
          onNavigate={() => setCurrentPage('signup')}
          onForgotPassword={() => setCurrentPage('forgot')}
          onLoginSuccess={() => {
            const freshUser = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(freshUser);
            setVStatus(localStorage.getItem('verificationStatus'));
            setCurrentPage('dashboard');
          }}
        />
      )}
      {currentPage === 'signup' && (
        <SignUp onNavigate={() => setCurrentPage('login')} />
      )}
      {currentPage === 'forgot' && (
        <ForgotPassword onNavigate={() => setCurrentPage('login')} />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'commands' && (
        <ClientCommands onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'negotiations' && (
        <Negotiations onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'offers' && (
        <MyOffers onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'orders' && (
        <Orders onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'wallet' && (
        <Wallet onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'settings' && (
        <Settings onNavigate={(page) => setCurrentPage(page)} />
      )}
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App
