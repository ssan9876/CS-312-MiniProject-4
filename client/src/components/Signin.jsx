import { useState } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

export default function Signin({ notice, onSignedIn, onGoToSignup }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await api('/signin', {
        method: 'POST',
        body: { user_id: userId, password },
      });
      onSignedIn(data.user);
    } catch (err) {
      setError(err.message);
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card auth-card">
      <h2>Sign In</h2>

      {notice && !error && <Message type={notice.type}>{notice.text}</Message>}
      <Message type="error">{error}</Message>

      <form onSubmit={handleSubmit}>
        <label htmlFor="signin-user">User ID</label>
        <input
          id="signin-user"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          maxLength={255}
          autoComplete="username"
          required
        />

        <label htmlFor="signin-password">Password</label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={255}
          autoComplete="current-password"
          required
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="switch-link">
        Don't have an account?{' '}
        <button type="button" className="link" onClick={onGoToSignup}>Sign up</button>
      </p>
    </section>
  );
}
