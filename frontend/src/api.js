const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const getAuthToken = () => localStorage.getItem('authToken');
export const setAuthToken = (token) => localStorage.setItem('authToken', token);
export const removeAuthToken = () => localStorage.removeItem('authToken');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

export async function login(userId) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  
  if (!res.ok) throw new Error('Login failed');
  
  const data = await res.json();
  setAuthToken(data.token);
  return data;
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/api/auth/users`);
  return res.json();
}

export async function getTickets() {
  const res = await fetch(`${API_URL}/api/tickets`, {
    headers: getHeaders()
  });
  
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function createTicket(data) {
  const res = await fetch(`${API_URL}/api/tickets`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
}

export async function updateTicketStatus(id, status) {
  const res = await fetch(`${API_URL}/api/tickets/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  
  if (!res.ok) throw new Error('Failed to update ticket');
  return res.json();
}

export async function deleteTicket(id) {
  const res = await fetch(`${API_URL}/api/tickets/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  
  if (!res.ok) throw new Error('Failed to delete ticket');
}
