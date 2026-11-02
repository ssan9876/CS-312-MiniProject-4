import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import Header from './components/Header.jsx';
import Signin from './components/Signin.jsx';
import Signup from './components/Signup.jsx';
import Home from './components/Home.jsx';
import Account from './components/Account.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading'); // loading | signin | signup | home | account
  const [notice, setNotice] = useState(null);

  // On first load, ask the backend who is signed in. This is also the
  // "simple API call" that confirms the frontend can reach the backend.
  useEffect(() => {
    api('/me')
      .then((data) => {
        console.log('Connected to backend. /api/me returned:', data);
        setUser(data.user);
        setView(data.user ? 'home' : 'signin');
      })
      .catch((err) => {
        console.error('Could not reach the backend:', err);
        setNotice({ type: 'error', text: err.message });
        setView('signin');
      });
  }, []);

  function go(nextView, nextNotice = null) {
    setNotice(nextNotice);
    setView(nextView);
  }

  function handleSignedIn(signedInUser) {
    setUser(signedInUser);
    go('home');
  }

  async function handleSignOut() {
    try {
      await api('/signout', { method: 'POST' });
    } finally {
      setUser(null);
      go('signin');
    }
  }

  // Called by any component whose API call came back 401 (session expired).
  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setNotice({ type: 'error', text: 'Your session has ended. Please sign in again.' });
    setView('signin');
  }, []);

  return (
    <div className="app">
      <Header
        user={user}
        view={view}
        onHome={() => go('home')}
        onAccount={() => go('account')}
        onSignOut={handleSignOut}
      />

      <main className="container">
        {view === 'loading' && <p className="muted">Loading…</p>}

        {view === 'signin' && (
          <Signin
            notice={notice}
            onSignedIn={handleSignedIn}
            onGoToSignup={() => go('signup')}
          />
        )}

        {view === 'signup' && (
          <Signup
            onSignedUp={(message) => go('signin', { type: 'success', text: message })}
            onGoToSignin={() => go('signin')}
          />
        )}

        {view === 'home' && user && (
          <Home user={user} onUnauthorized={handleUnauthorized} />
        )}

        {view === 'account' && user && (
          <Account
            user={user}
            onUpdated={setUser}
            onBack={() => go('home')}
            onUnauthorized={handleUnauthorized}
          />
        )}
      </main>
    </div>
  );
}
