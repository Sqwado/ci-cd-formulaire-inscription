import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { countUsers } from './api/api';
import AdminRoute from './components/AdminRoute/AdminRoute';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';
import AdminUsersPage from './pages/AdminUsersPage';
import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import RegistrationPage from './pages/RegistrationPage';

function App() {
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadUsersCount() {
      try {
        const total = await countUsers();
        if (isMounted) {
          setUsersCount(total);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setUsersCount(0);
        }
      }
    }

    loadUsersCount();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gestion des inscrits</h1>
        <p data-testid="users-registration-message">
          <span data-testid="users-count">{usersCount}</span> utilisateur(s) déjà inscrit(s)
        </p>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId"
          element={
            <AdminRoute>
              <AdminUserDetailPage />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
