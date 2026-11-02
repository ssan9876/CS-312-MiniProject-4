import { useState } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

// Controlled form for creating a new post (replaces the "Create a New Post" form in index.ejs).
export default function BlogPostForm({ onCreated, onUnauthorized }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = { title: title.trim(), body: body.trim() };
    if (!formData.title || !formData.body) {
      setError('Title and post are both required.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const data = await api('/blogs', { method: 'POST', body: formData });
      onCreated(data.post);
      setTitle('');
      setBody('');
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card">
      <h2>Create a New Post</h2>

      <Message type="error">{error}</Message>

      <form onSubmit={handleSubmit}>
        <label htmlFor="new-title">Title</label>
        <input
          id="new-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          required
        />

        <label htmlFor="new-body">Post</label>
        <textarea
          id="new-body"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </section>
  );
}
