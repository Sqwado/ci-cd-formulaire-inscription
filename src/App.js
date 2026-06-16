import axios from 'axios';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import RegistrationPage from './pages/RegistrationPage';

function App() {
  const port = process.env.REACT_APP_SERVER_PORT || '8000';
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    async function countUsers() {
      try {
        const api = axios.create({
          baseURL: `http://localhost:${port}`,
        });
        const response = await api.get('/users');
        setUsersCount(response.data.users.length);
      } catch (error) {
        console.error(error);
      }
    }

    countUsers();
  }, [port]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Users manager</h1>
        <p>
          <span data-testid="users-count">{usersCount}</span> user(s) already registered
        </p>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/list" element={<ListPage />} />
      </Routes>
    </div>
  );
}

export default App;
