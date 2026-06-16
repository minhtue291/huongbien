import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Dán đoạn thông số Firebase của riêng bạn vào đây
const firebaseConfig = {
  apiKey: "AIzaSyD535fhXPk8vrHFNPk5dZWVs2k6Y_kVqKY",
  authDomain: "huongbien.firebaseapp.com",
  projectId: "huongbien",
  storageBucket: "huongbien.firebasestorage.app",
  messagingSenderId: "1065411060243",
  appId: "1:1065411060243:web:ed7043585092dae048d5e6",
  measurementId: "G-H21626YH2K"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo và export Database Firestore để sử dụng toàn app
export const db = getFirestore(app);