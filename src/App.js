import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import RegistrationPage from './pages/RegistrationPage';
import { getRegistrations } from './module/module';

function App() {
  const location = useLocation();
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    setUsersCount(getRegistrations().length);
  }, [location]);

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
      </Routes>
    </div>
  );
}

export default App;
