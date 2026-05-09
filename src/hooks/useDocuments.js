import { useState, useEffect } from 'react';

const STORAGE_KEY = 'academic_docs';
// วาง URL ของ Google Apps Script ที่นี่ (ถ้ามี)
const API_URL = 'https://script.google.com/macros/s/AKfycbyutG_Bt9LML5WYNKts7rbNDJeWCkTl7L8aimZ6FrNl9h6BTqxa3I_5BzZkV6IJbU4D/exec'; 

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFromSheets = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      // ปรับปรุงการ Fetch ให้เรียบง่ายที่สุดเพื่อเลี่ยงปัญหา CORS
      // เพิ่ม timestamp เพื่อเลี่ยง cache
      const fetchUrl = API_URL.includes('?') 
        ? `${API_URL}&_=${Date.now()}` 
        : `${API_URL}?_=${Date.now()}`;

      const response = await fetch(fetchUrl, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle both formats: simple array (old) or object with documents/users (new)
      let rawDocs = [];
      let rawUsers = [];

      if (data && Array.isArray(data)) {
        rawDocs = data;
      } else if (data && typeof data === 'object') {
        rawDocs = data.documents || [];
        rawUsers = data.users || [];
      } else {
        console.warn('Unexpected data format from API:', data);
      }

      // กรองเอาเฉพาะข้อมูลที่ใช้งานได้
      const validDocs = rawDocs && Array.isArray(rawDocs) 
        ? rawDocs.filter(d => d && d.id).map(d => ({
            ...d,
            serial: Number(d.serial) || 0
          }))
        : [];

      setDocuments(validDocs);
      setUsers(rawUsers);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(validDocs));
      localStorage.setItem('doc_users', JSON.stringify(rawUsers));
    } catch (error) {
      console.error('Fetch error:', error);
      // หาก Fetch ไม่สำเร็จ ให้ใช้ข้อมูลจาก LocalStorage แทนเพื่อไม่ให้หน้าจอขาว
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setDocuments(JSON.parse(stored));
      const storedUsers = localStorage.getItem('doc_users');
      if (storedUsers) setUsers(JSON.parse(storedUsers));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const DEFAULT_ADMIN = {
      id: 'admin-fallback',
      name: 'แอดมินฝ่ายอำนวยการ',
      username: 'อำนวยการ',
      password: 'อำนวยการ',
      role: 'ADMIN'
    };

    if (API_URL) {
      // โหลดจาก LocalStorage ก่อนเพื่อให้ใช้งานได้ทันทีระหว่างรอ Fetch
      const storedUsers = localStorage.getItem('doc_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers([DEFAULT_ADMIN]);
      }
      
      const storedDocs = localStorage.getItem(STORAGE_KEY);
      if (storedDocs) setDocuments(JSON.parse(storedDocs));
      
      fetchFromSheets();
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDocuments(JSON.parse(stored));
      } else {
        const dummyDocs = [
          {
            id: '1',
            type: 'INBOUND',
            serial: 1,
            date: '2024-05-01',
            docNumber: 'ศธ 0100/1234',
            from: 'กระทรวงศึกษาธิการ',
            to: 'ฝ่ายวิชาการ',
            subject: 'แจ้งนโยบายการจัดการเรียนการสอนปี 2567',
            action: 'ทราบ/ดำเนินการ',
            remarks: '-',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          }
        ];
        setDocuments(dummyDocs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyDocs));
      }
      
      const storedUsers = localStorage.getItem('doc_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers([DEFAULT_ADMIN]);
      }
    }
  }, []);

  const saveDocs = async (newDocs, apiAction = null) => {
    setDocuments(newDocs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDocs));

    if (API_URL && apiAction) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          mode: 'no-cors', // Apps Script requires no-cors for simple posts
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...apiAction,
            target: apiAction.target || 'DOCS'
          })
        });
        // เพื่อความแม่นยำให้อัปเดตข้อมูลจาก Server อีกครั้งหลังจากส่ง (ดีเลย์นิดหน่อย)
        setTimeout(fetchFromSheets, 1500);
      } catch (error) {
        console.error('API Error:', error);
      }
    }
  };

  const getNextSerial = () => {
    if (!documents || documents.length === 0) return 1;
    const serials = documents.map(d => Number(d.serial)).filter(s => !isNaN(s));
    return serials.length === 0 ? 1 : Math.max(...serials) + 1;
  };

  const addDocument = (doc, user) => {
    const newDoc = {
      ...doc,
      id: crypto.randomUUID(),
      serial: getNextSerial(),
      status: 'ACTIVE',
      recordedBy: user ? user.name : 'Unknown',
      createdAt: new Date().toISOString(),
    };
    saveDocs([...documents, newDoc], { target: 'DOCS', actionType: 'ADD', data: newDoc });
  };

  const updateDocument = (id, updates) => {
    const newDocs = documents.map(d => d.id === id ? { ...d, ...updates } : d);
    const updatedDoc = newDocs.find(d => d.id === id);
    saveDocs(newDocs, { target: 'DOCS', actionType: 'UPDATE', id, data: updatedDoc });
  };

  const deleteDocument = (id) => {
    const newDocs = documents.map(d => d.id === id ? { ...d, status: 'TRASHED', deletedAt: new Date().toISOString() } : d);
    saveDocs(newDocs, { target: 'DOCS', actionType: 'DELETE', id });
  };

  const recoverDocument = (id) => {
    const newDocs = documents.map(d => d.id === id ? { ...d, status: 'ACTIVE', deletedAt: undefined } : d);
    saveDocs(newDocs, { target: 'DOCS', actionType: 'RECOVER', id });
  };

  const permanentDelete = (id) => {
    const newDocs = documents.filter(d => d.id !== id);
    saveDocs(newDocs, { target: 'DOCS', actionType: 'PERMANENT_DELETE', id });
  };

  const addUser = (user) => {
    const newUser = {
      ...user,
      id: crypto.randomUUID(),
      role: 'USER',
      createdAt: new Date().toISOString()
    };
    saveDocs(documents, { target: 'USERS', actionType: 'ADD', data: newUser });
  };

  const deleteUser = (userId) => {
    saveDocs(documents, { target: 'USERS', actionType: 'DELETE', id: userId });
  };

  return {
    documents,
    users,
    loading,
    addDocument,
    updateDocument,
    deleteDocument,
    recoverDocument,
    permanentDelete,
    addUser,
    deleteUser,
    refresh: fetchFromSheets
  };
}
