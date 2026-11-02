export default function Header({ user, view, onHome, onAccount, onSignOut }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <button type="button" className="brand" onClick={user ? onHome : undefined}>
          My Blog
        </button>

        {user && (
          <nav className="header-nav">
            <span className="signed-in">
              Signed in as <strong>{user.name}</strong> <span className="muted">({user.login})</span>
            </span>
            <div className="header-actions">
              {view !== 'account' ? (
                <button type="button" className="btn btn-ghost" onClick={onAccount}>My Account</button>
              ) : (
                <button type="button" className="btn btn-ghost" onClick={onHome}>All Posts</button>
              )}
              <button type="button" className="btn btn-outline" onClick={onSignOut}>Sign Out</button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
