import { useState } from 'react';
import EditPost from './EditPost.jsx';

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// Renders every post. Edit/Delete only appear on posts the signed-in user created;
// the backend checks ownership again on every edit and delete request.
export default function PostList({ posts, user, onUpdated, onDelete, onUnauthorized }) {
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(post) {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    setDeletingId(post.blog_id);
    try {
      await onDelete(post);
    } finally {
      setDeletingId(null);
    }
  }

  if (posts.length === 0) {
    return <p className="muted empty">No posts yet. Be the first to write one!</p>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => {
        const isOwner = post.creator_user_id === user.user_id;
        const isEditing = editingId === post.blog_id;

        return (
          <article key={post.blog_id} className={`card post${isOwner ? ' post-own' : ''}`}>
            {isEditing ? (
              <EditPost
                post={post}
                onSaved={(updated) => {
                  onUpdated(updated);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
                onUnauthorized={onUnauthorized}
              />
            ) : (
              <>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-meta">
                  By <strong>{post.creator_name}</strong>
                  {isOwner && <span className="badge">You</span>}
                  {' · '}
                  {formatDate(post.date_created)}
                  {post.date_updated && (
                    <span className="muted" title={`Edited ${formatDate(post.date_updated)}`}> (edited)</span>
                  )}
                </p>
                <p className="post-body">{post.body}</p>

                {isOwner && (
                  <div className="button-row">
                    <button
                      type="button"
                      className="btn btn-outline btn-small"
                      onClick={() => setEditingId(post.blog_id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(post)}
                      disabled={deletingId === post.blog_id}
                    >
                      {deletingId === post.blog_id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                )}
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
