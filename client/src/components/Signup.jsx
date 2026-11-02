import { useState } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

export default function Signup({ onSignedUp, onGoToSignin }) {
  const [form, setForm] = useState({ name: '', user_id: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await api('/signup', { method: 'POST', body: form });
      onSignedUp(data.message);
    } catch (err) {
      setError(err.message);
      setForm({ ...form, password: '' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card auth-card">
      <h2>Sign Up</h2>

      <Message type="error">{error}</Message>

      <form onSubmit={handleSubmit}>
        <label htmlFor="signup-name">Name</label>
        <input
          id="signup-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          maxLength={255}
          autoComplete="name"
          required
        />

        <label htmlFor="signup-user">User ID</label>
        <input
          id="signup-user"
          name="user_id"
          type="text"
          value={form.user_id}
          onChange={handleChange}
          maxLength={255}
          autoComplete="username"
          required
        />

        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          maxLength={255}
          autoComplete="new-password"
          required
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>

      <p className="switch-link">
        Already have an account?{' '}
        <button type="button" className="link" onClick={onGoToSignin}>Sign in</button>
      </p>
    </section>
  );
}
