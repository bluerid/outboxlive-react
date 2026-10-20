import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';

const AdminUsersPage: React.FC = () => {
    const { token, logout, loading: authLoading, redirectAfterLogout, setRedirectAfterLogout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            setLoading(true);
            setError(null);
            setUsers([]);
            return;
        }
        if (!token) {
            // If we have a redirectAfterLogout from a recent logout, use it
            if (redirectAfterLogout) {
                navigate(redirectAfterLogout);
                setRedirectAfterLogout(null); // clear after use
                return;
            }
            navigate('/login');
            return;
        }
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/users', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        logout(); // just call logout, navigation will be handled by the useEffect
                        return;
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch users');
                }

                const data = await response.json();
                // Assuming the response is an array of users
                setUsers(Array.isArray(data) ? data : []);
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token, logout, navigate, authLoading, redirectAfterLogout, setRedirectAfterLogout]);

    const handleSoftDelete = async (userId: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            // Optimistically remove the user from the list
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId && user._id !== userId));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-accent flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-primary">Loading users...</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-accent flex items-center justify-center">
                <div className="w-full max-w-md space-y-6">
                    <h3 className="text-center text-primary mb-4">Error Loading Users</h3>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white font-medium rounded-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-lg focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-primary"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="page-container">
                <AdminHeader />
                <div className="page-introduction">
                    <h1>Admin Dashboard</h1>
                    <p>Manage users in the system</p>
                </div>
                {users.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-primary mb-4">No users found</h3>
                        <p className="text-muted">
                            No users registered in the system yet.
                        </p>
                    </div>
                ) : (
                    <div className="">
                        <table className="" style={{ width: "stretch" }}>
                            <thead>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id || user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.name || user.username || 'Unnamed'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.role && (
                                                <span className={`user-role ${user.role}`}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={() => handleSoftDelete(user.id || user._id)}
                                                className="btn btn-outline btn-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;