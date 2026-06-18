import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavLink from '../components/NavLink/NavLink';
import PageNavigation from '../components/PageNavigation/PageNavigation';
import Toast from '../components/Toast/Toast';
import { useToast } from '../hooks/useToast';
import { loginAdmin } from '../api/api';
import './AdminLoginPage.css';

function AdminLoginPage() {
  const navigate = useNavigate();
  const { toastMessage, toastType, showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await loginAdmin(email, password);
      navigate('/admin/users');
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Connexion impossible';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="admin-card admin-login-page" data-testid="admin-login-page">
        <h1>Connexion administrateur</h1>
        <p>Accédez à l&apos;espace de gestion des inscrits.</p>
        <form onSubmit={onSubmit} data-testid="admin-login-form">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            data-testid="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="admin-password">Mot de passe</label>
          <input
            id="admin-password"
            data-testid="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button
            type="submit"
            className="nav-link nav-link--primary"
            data-testid="admin-login-submit"
            disabled={isSubmitting}
          >
            Se connecter
          </button>
        </form>

        <PageNavigation variant="inline" ariaLabel="Navigation admin login">
          <NavLink to="/" testId="go-to-home">
            Accueil
          </NavLink>
        </PageNavigation>
      </section>

      <Toast message={toastMessage} type={toastType} />
    </>
  );
}

export default AdminLoginPage;
