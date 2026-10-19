import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';

const AdminPostsPage: React.FC = () => {
    const { token, logout, loading: authLoading, redirectAfterLogout, setRedirectAfterLogout } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<any>(null);

    let [searchParams] = useSearchParams();
    const pageStr = searchParams.get('page');
    const page = pageStr !== null ? parseInt(pageStr, 10) : 1;

    useEffect(() => {
        if (authLoading) {
            setLoading(true);
            setError(null);
            setPosts([]);
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
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/posts?page=${page}`, {
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
                    throw new Error(errorData.message || 'Failed to fetch posts');
                }

                const data = await response.json();
                // Assuming the response is an object with posts array and pagination
                setPosts(Array.isArray(data.posts) ? data.posts : []);
                setPagination(data.pagination || {});
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [token, logout, navigate, authLoading, redirectAfterLogout, setRedirectAfterLogout, page]);

    const handleSoftDelete = async (postId: string) => {
        try {
            const response = await fetch(`/api/posts/${postId}`, {
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
                throw new Error(errorData.message || 'Failed to delete post');
            }

            // Optimistically remove the post from the list
            setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-accent flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-primary">Loading posts...</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-accent flex items-center justify-center">
                <div className="w-full max-w-md space-y-6">
                    <h3 className="text-center text-primary mb-4">Error Loading Posts</h3>
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
                    <h1>Admin Posts Management</h1>
                    <p>Manage posts in the system</p>
                </div>
                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <h3 className="text-primary mb-4">No posts found</h3>
                        <p className="text-muted">
                            No posts in the system yet.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Author
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created At
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {posts.map((post) => (
                                        <tr key={post._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {post.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {post.author?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => handleSoftDelete(post._id)}
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
                        {pagination && (
                            <div className="pagination mt-4">
                                <button
                                    onClick={() => {
                                        const newPage = Math.max(page - 1, 1);
                                        navigate(`/?page=${newPage}`);
                                    }}
                                    disabled={page <= 1}
                                    className="btn btn-outline"
                                >
                                    Previous
                                </button>
                                <span className="pagination-info">
                                    Page {page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => {
                                        const newPage = Math.min(page + 1, pagination.totalPages);
                                        navigate(`/?page=${newPage}`);
                                    }}
                                    disabled={page >= pagination.totalPages}
                                    className="btn btn-outline"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPostsPage;