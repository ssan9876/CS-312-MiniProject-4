import { useState } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

// Edit form, pre-filled from the post passed in as a prop (replaces edit.ejs).
export default function EditPost({ post, onSaved, onCancel, onUnauthorized }) {
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
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
      const data = await api(`/blogs/${post.blog_id}`, { method: 'PUT', body: formData });
      onSaved(data.post);
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <h3>Edit Post</h3>

      <Message type="error">{error}</Message>

      <label htmlFor={`edit-title-${post.blog_id}`}>Title</label>
      <input
        id={`edit-title-${post.blog_id}`}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={255}
        required
        autoFocus
      />

      <label htmlFor={`edit-body-${post.blog_id}`}>Post</label>
      <textarea
        id={`edit-body-${post.blog_id}`}
        rows={6}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />

      <div className="button-row">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
