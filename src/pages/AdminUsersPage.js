import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchRegistrations();
      setUsers(data);
    } catch (error) {
      showToast(error.message || 'Impossible de charger les inscrits', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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
      <div className="admin-page-wrapper">
        <section className="admin-card" data-testid="admin-users-page">
          <h1>Gestion admin des inscrits</h1>

          {users.length === 0 ? (
            <p data-testid="admin-no-users">Aucun inscrit.</p>
          ) : (
            <ul className="admin-users-list" data-testid="admin-users-list">
              {users.map((user) => (
                <li key={user.id} data-testid="admin-user-item">
                  <span>
                    {user.prenom} {user.nom}
                  </span>
                  <div className="admin-user-actions">
                    <NavLink
                      to={`/admin/users/${user.id}`}
                      variant="outline"
                      testId={`admin-view-user-${user.id}`}
                    >
                      Voir détail
                    </NavLink>
                    <button
                      type="button"
                      className="nav-link nav-link--danger"
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
        </section>

        <PageNavigation variant="card" ariaLabel="Navigation admin users">
          <button
            type="button"
            className="nav-link nav-link--secondary"
            data-testid="admin-logout"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
          <NavLink to="/" testId="go-to-home">
            Accueil
          </NavLink>
        </PageNavigation>
      </div>

      <Toast message={toastMessage} type={toastType} />
    </>
  );
}

export default AdminUsersPage;
