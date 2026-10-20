import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminHeader: React.FC = () => {
    const { logout, token } = useAuth();
    const location = useLocation();

    return (
        <div className="page-header">
            <div className="page-header-brand">
                OutboxLive Admin
            </div>
            <div className="page-header-actions">
                {token && (
                    <>
                        <Link
                            to="/admin/users"
                            className={location.pathname === '/admin/users' ? 'btn btn-primary' : 'btn btn-outline'}
                        >
                            Users
                        </Link>
                        <Link
                            to="/admin/posts"
                            className={location.pathname === '/admin/posts' ? 'btn btn-primary' : 'btn btn-outline'}
                            style={{ marginLeft: '0.5rem' }}
                        >
                            Posts
                        </Link>
                        <button
                            onClick={logout}
                            className="btn btn-secondary"
                            style={{ marginLeft: '0.5rem' }}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminHeader;