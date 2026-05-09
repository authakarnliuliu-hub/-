import { useState, useEffect } from 'react';

const USERS_STORAGE_KEY = 'academic_users';
const DEFAULT_ADMIN = {
  id: 'admin',
  name: 'แอดมินฝ่ายอำนวยการ',
  username: 'อำนวยการ',
  password: 'อำนวยการ',
  role: 'ADMIN',
  createdAt: new Date().toISOString()
};

export function useUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      setUsers(JSON.parse(stored));
    } else {
      setUsers([DEFAULT_ADMIN]);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]));
    }
  }, []);

  const saveUsers = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
  };

  const addUser = (user) => {
    const newUser = {
      ...user,
      id: crypto.randomUUID(),
      role: 'USER',
      createdAt: new Date().toISOString()
    };
    saveUsers([...users, newUser]);
  };

  const updateUser = (id, updates) => {
    const newUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);
    saveUsers(newUsers);
  };

  const deleteUser = (id) => {
    if (id === 'admin') return; // Cannot delete primary admin
    const newUsers = users.filter(u => u.id !== id);
    saveUsers(newUsers);
  };

  const authenticate = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    return user || null;
  };

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    authenticate
  };
}
