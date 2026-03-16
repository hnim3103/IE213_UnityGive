const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem('token');
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getFavorites() {
  const res = await fetch(`${API_BASE}/api/favourites`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

export async function addFavorite(campaignId) {
  const res = await fetch(`${API_BASE}/api/favourites`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ campaignId }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to add favorite");
  return res.json();
}

export async function removeFavorite(campaignId) {
  const res = await fetch(`${API_BASE}/api/favourites`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ campaignId }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to remove favorite");
  return res.json();
}
