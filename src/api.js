const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data?.error === "string"
        ? data.error
        : data?.message || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}

export async function apiSend(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data?.error === "string"
        ? data.error
        : data?.message || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}
