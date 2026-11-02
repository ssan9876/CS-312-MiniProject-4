// Shows a success or error message, matching the .notice / .error lines from the EJS pages.
export default function Message({ type = 'error', children }) {
  if (!children) return null;
  return (
    <p className={`message message-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
