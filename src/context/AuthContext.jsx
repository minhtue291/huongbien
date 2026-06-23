import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase'; // Import db từ file firebase.js của bạn
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (phoneNumber) => {
    // Kiểm tra số điện thoại trong Firestore
    const userRef = doc(db, 'authorized_users', phoneNumber);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = { phoneNumber, ...userSnap.data() };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: "Số điện thoại chưa được cấp quyền!" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);