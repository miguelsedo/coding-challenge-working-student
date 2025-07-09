import { useEffect, useState } from 'react';
import { getTickets, createTicket, updateTicketStatus, deleteTicket, login, getUsers, getAuthToken, removeAuthToken } from './api';
import './App.css';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      setIsLoggedIn(true);
      loadTickets();
    }
    loadUsers();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setTickets(await getTickets());
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsers(await getUsers());
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleLogin = async () => {
    if (!selectedUser) return;
    try {
      const data = await login(selectedUser);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      await loadTickets();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setTickets([]);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createTicket({ title, description });
      await loadTickets();
      setTitle('');
      setDescription('');
      setShowForm(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTicketStatus(id, newStatus);
      await loadTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this ticket?')) return;
    try {
      await deleteTicket(id);
      await loadTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login">
        <h1>Support Desk</h1>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Select user</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.organisation_name})
            </option>
          ))}
        </select>
        <button onClick={handleLogin} disabled={!selectedUser}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>Support Desk</h1>
          <div className="company">{tickets[0]?.organisation_name || ''}</div>
        </div>
        <div>
          <span>{currentUser?.name}</span>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <main>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Ticket'}
        </button>

        {showForm && (
          <div className="form">
            <input
              placeholder="Issue title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
            <button onClick={handleCreate} disabled={!title.trim()}>
              Create
            </button>
          </div>
        )}

        <div className="tickets">
          {loading ? (
            <div className="loading">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <h3>No tickets yet</h3>
              <p>Create your first ticket to get started!</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className="ticket">
                <div className="ticket-header">
                  <span>#{ticket.id}</span>
                  <div>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className={ticket.status}
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button onClick={() => handleDelete(ticket.id)}>×</button>
                  </div>
                </div>
                <h3>{ticket.title}</h3>
                <p>{ticket.description}</p>
                <div className="ticket-footer">
                  <span>by {ticket.user_name}</span>
                  <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
