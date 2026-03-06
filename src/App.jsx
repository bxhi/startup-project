import { useState } from 'react'
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

function App() {
  const [currentPage, setCurrentPage] = useState('onboarding');

  return (
    <div className="app">
      {currentPage === 'onboarding' && (
        <Onboarding onNavigate={(page) => setCurrentPage(page)} />
      )}
      {currentPage === 'login' && (
        <Login
          onNavigate={() => setCurrentPage('signup')}
          onForgotPassword={() => setCurrentPage('forgot')}
          onLoginSuccess={() => setCurrentPage('dashboard')}
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
    </div>
  )
}

export default App
