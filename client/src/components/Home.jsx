import { useEffect, useState } from 'react';
import { api } from '../api.js';
import BlogPostForm from './BlogPostForm.jsx';
import PostList from './PostList.jsx';
import Message from './Message.jsx';

// Homepage: the create form plus the list of all posts (replaces index.ejs).
// The posts array lives here so creating, editing and deleting all update the list right away.
export default function Home({ user, onUnauthorized }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/blogs')
      .then((data) => {
        console.log('Fetched posts from backend:', data.posts);
        setPosts(data.posts);
      })
      .catch((err) => {
        if (err.status === 401) return onUnauthorized();
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [onUnauthorized]);

  function handleCreated(post) {
    setPosts((current) => [post, ...current]);
  }

  // Swap the edited post into the list in place.
  function handleUpdated(updated) {
    setPosts((current) => current.map((p) => (p.blog_id === updated.blog_id ? updated : p)));
  }

  async function handleDelete(post) {
    setError(null);
    try {
      await api(`/blogs/${post.blog_id}`, { method: 'DELETE' });
      setPosts((current) => current.filter((p) => p.blog_id !== post.blog_id));
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      if (err.status === 404) {
        setPosts((current) => current.filter((p) => p.blog_id !== post.blog_id));
      }
      setError(err.message);
    }
  }

  return (
    <div className="home">
      <BlogPostForm onCreated={handleCreated} onUnauthorized={onUnauthorized} />

      <section>
        <h2 className="section-title">
          All Posts {!loading && <span className="count">{posts.length}</span>}
        </h2>

        <Message type="error">{error}</Message>

        {loading ? (
          <p className="muted">Loading posts…</p>
        ) : (
          <PostList
            posts={posts}
            user={user}
            onUpdated={handleUpdated}
            onDelete={handleDelete}
            onUnauthorized={onUnauthorized}
          />
        )}
      </section>
    </div>
  );
}
