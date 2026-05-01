const API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_URL}/api/v1`;

export const fetchApi = async (url: string, opts?: RequestInit) => {
  const res = await fetch(`${API_BASE}${url}`, { 
    credentials: 'include', 
    headers: { 'Content-Type': 'application/json' }, 
    ...opts 
  });
  
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'API request failed');
  return data.data;
};

export const getMe = () => fetchApi('/auth/superadmin/me');
