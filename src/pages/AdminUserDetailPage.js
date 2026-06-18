import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavLink from '../components/NavLink/NavLink';
import PageNavigation from '../components/PageNavigation/PageNavigation';
import Toast from '../components/Toast/Toast';
import { useToast } from '../hooks/useToast';
import { deleteUser, fetchUserDetail } from '../api/api';
import './AdminUserDetailPage.css';

function AdminUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toastMessage, toastType, showToast } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const data = await fetchUserDetail(userId);
        if (isMounted) {
          setUser(data);
        }
      } catch (error) {
        if (isMounted) {
          const message = error.response?.data?.detail || error.message || 'Chargement impossible';
          showToast(message, 'error');
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [userId, showToast]);

  const handleDelete = async () => {
    try {
      await deleteUser(userId);
      showToast('Inscrit supprimé.', 'success');
      navigate('/admin/users');
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Suppression impossible';
      showToast(message, 'error');
    }
  };

  if (!user) {
    return (
      <>
        <section className="admin-user-detail-page" data-testid="admin-user-detail-page">
          <p data-testid="admin-user-loading">Chargement...</p>
        </section>
        <Toast message={toastMessage} type={toastType} />
      </>
    );
  }

  return (
    <>
      <section className="admin-user-detail-page" data-testid="admin-user-detail-page">
        <h1>
          {user.prenom} {user.nom}
        </h1>
        <dl data-testid="admin-user-private-info">
          <dt>Email</dt>
          <dd data-testid="admin-user-email">{user.email}</dd>
          <dt>Date de naissance</dt>
          <dd data-testid="admin-user-birthdate">{user.dateOfBirth}</dd>
          <dt>Ville</dt>
          <dd data-testid="admin-user-city">{user.ville}</dd>
          <dt>Code postal</dt>
          <dd data-testid="admin-user-postal">{user.codePostal}</dd>
        </dl>

        <button type="button" data-testid="admin-delete-user" onClick={handleDelete}>
          Supprimer cet inscrit
        </button>

        <PageNavigation variant="card" ariaLabel="Navigation admin detail">
          <NavLink to="/admin/users" testId="go-to-admin-users">
            Retour à la liste admin
          </NavLink>
        </PageNavigation>
      </section>

      <Toast message={toastMessage} type={toastType} />
    </>
  );
}

export default AdminUserDetailPage;
