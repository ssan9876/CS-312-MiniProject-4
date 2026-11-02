import { useState } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

// Change user ID and/or password (replaces account.ejs).
export default function Account({ user, onUpdated, onBack, onUnauthorized }) {
  const [form, setForm] = useState({ user_id: user.login, new_password: '', current_password: '' });
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const data = await api('/account', { method: 'PUT', body: form });
      onUpdated(data.user);
      setNotice(data.message);
      setForm({ user_id: data.user.login, new_password: '', current_password: '' });
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message);
      setForm({ ...form, current_password: '' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card auth-card">
      <h2>My Account</h2>

      <Message type="success">{notice}</Message>
      <Message type="error">{error}</Message>

      <form onSubmit={handleSubmit}>
        <label htmlFor="acct-user">User ID</label>
        <input
          id="acct-user"
          name="user_id"
          type="text"
          value={form.user_id}
          onChange={handleChange}
          maxLength={255}
          autoComplete="username"
          required
        />

        <label htmlFor="acct-new">
          New Password <span className="hint">(leave blank to keep your current one)</span>
        </label>
        <input
          id="acct-new"
          name="new_password"
          type="password"
          value={form.new_password}
          onChange={handleChange}
          maxLength={255}
          autoComplete="new-password"
        />

        <label htmlFor="acct-current">
          Current Password <span className="hint">(required to save changes)</span>
        </label>
        <input
          id="acct-current"
          name="current_password"
          type="password"
          value={form.current_password}
          onChange={handleChange}
          maxLength={255}
          autoComplete="current-password"
          required
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Saving…' : 'Update Account'}
        </button>
      </form>

      <p className="switch-link">
        <button type="button" className="link" onClick={onBack}>← Back to blog</button>
      </p>
    </section>
  );
}
