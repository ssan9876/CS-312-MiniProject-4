// Small wrapper around fetch for talking to the Express backend.
// Every backend route answers with JSON: { ...data } on success, { error } on failure.
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin', // send the session cookie
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON reply, usually because the backend isn't running.
  }

  if (!res.ok) {
    const err = new Error(data.error || `Could not reach the server (HTTP ${res.status}). Is the backend running?`);
    err.status = res.status;
    throw err;
  }
  return data;
}
