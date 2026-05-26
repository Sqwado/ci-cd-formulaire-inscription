import { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import RegistrationPage from './pages/RegistrationPage';

function App() {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <div className="App">
      {showRegistration ? (
        <RegistrationPage />
      ) : (
        <HomePage onStart={() => setShowRegistration(true)} />
      )}
    </div>
  );
}

export default App;
