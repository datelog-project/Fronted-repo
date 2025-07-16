// App.tsx
import React, { useState } from 'react';
import AuthPage from './components/AuthPage';
import InvitePage from './components/InvitePage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  if (isLoggedIn) return <InvitePage />;

  return (
    <AuthPage
      showSignup={showSignup}
      onToggle={() => setShowSignup(!showSignup)}
      onLogin={() => setIsLoggedIn(true)}
    />
  );
}

export default App;
