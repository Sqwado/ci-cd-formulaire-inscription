import { Navigate } from 'react-router-dom';
import { getAdminToken } from '../../api/api';

function AdminRoute({ children }) {
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminRoute;
