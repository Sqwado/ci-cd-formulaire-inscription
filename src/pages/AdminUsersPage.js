import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavLink from '../components/NavLink/NavLink';
import PageNavigation from '../components/PageNavigation/PageNavigation';
import Toast from '../components/Toast/Toast';
import { useToast } from '../hooks/useToast';
import { clearAdminToken, deleteUser, fetchRegistrations } from '../api/api';
import './AdminUsersPage.css';

function AdminUsersPage() {
  const navigate = useNavigate();
  const { toastMessage, toastType, showToast } = useToast();
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const data = await fetchRegistrations();
      setUsers(data);
    } catch (error) {
      showToast(error.message || 'Impossible de charger les inscrits', 'error');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [showToast]);

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      showToast('Inscrit supprimé.', 'success');
      await loadUsers();
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Suppression impossible';
      showToast(message, 'error');
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin/login');
  };

  return (
    <>
      <section className="admin-users-page" data-testid="admin-users-page">
        <h1>Gestion admin des inscrits</h1>

        {users.length === 0 ? (
          <p data-testid="admin-no-users">Aucun inscrit.</p>
        ) : (
          <ul data-testid="admin-users-list">
            {users.map((user) => (
              <li key={user.id} data-testid="admin-user-item">
                <span>
                  {user.prenom} {user.nom}
                </span>
                <div className="admin-user-actions">
                  <Link
                    to={`/admin/users/${user.id}`}
                    data-testid={`admin-view-user-${user.id}`}
                  >
                    Voir détail
                  </Link>
                  <button
                    type="button"
                    data-testid={`admin-delete-user-${user.id}`}
                    onClick={() => handleDelete(user.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <PageNavigation variant="card" ariaLabel="Navigation admin users">
          <button type="button" data-testid="admin-logout" onClick={handleLogout}>
            Déconnexion
          </button>
          <NavLink to="/" testId="go-to-home">
            Accueil
          </NavLink>
        </PageNavigation>
      </section>

      <Toast message={toastMessage} type={toastType} />
    </>
  );
}

export default AdminUsersPage;
