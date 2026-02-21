import { useState } from 'react'
import Login from './pages/Login/Login'
import SignUp from './pages/SignUp/SignUp'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <div className="app">
      {currentPage === 'login' && (
        <Login 
          onNavigate={() => setCurrentPage('signup')}
          onForgotPassword={() => setCurrentPage('forgot')}
        />
      )}
      {currentPage === 'signup' && (
        <SignUp onNavigate={() => setCurrentPage('login')} />
      )}
      {currentPage === 'forgot' && (
        <ForgotPassword onNavigate={() => setCurrentPage('login')} />
      )}
    </div>
  )
}

export default App
