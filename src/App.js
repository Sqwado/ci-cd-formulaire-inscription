import { Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import LegacyPage from './pages/LegacyPage';
import ListPage from './pages/ListPage';
import RegistrationPage from './pages/RegistrationPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/legacy" element={<LegacyPage />} />
      </Routes>
    </div>
  );
}

export default App;
