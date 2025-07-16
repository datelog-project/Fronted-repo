import React, { useState } from 'react';
import AuthPage from './components/AuthPage';
import MainPage from './components/MainPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  if (isLoggedIn) return <MainPage />;

  return (
    <AuthPage
      showSignup={showSignup}
      onToggle={() => setShowSignup(!showSignup)}
      onLogin={() => setIsLoggedIn(true)}
    />
  );
}

export default App;