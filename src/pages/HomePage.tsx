import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';

const HomePage: React.FC = () => {
    const { token, logout, loading: authLoading } = useAuth();
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
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/posts?page=${page}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Only include Authorization header if we have a token
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                if (!response.ok) {
                    if (response.status === 401 && token) {
                        // Only logout and redirect if we had a token but got 401
                        const redirectTo = logout();
                        navigate(redirectTo);
                        return;
                    }
                    // For 401 without token, or other errors, we'll handle below
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch posts');
                }

                const data = await response.json();
                setPosts(Array.isArray(data.posts) ? data.posts : []);
                setPagination(data.pagination || {});
            } catch (err: any) {
                // If we don't have a token and get a 401, that's expected - show empty posts with login prompt
                if (!token && err.message?.includes('401')) {
                    setPosts([]);
                    setError(null);
                } else {
                    setError(err.message || 'An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [token, logout, navigate, authLoading, page]);

    if (loading) {
        return (
            <div className="min-h-screen">
                <div className="text-center">
                    <h3 className="text-primary">Loading...</h3>
                </div>
            </div>
        );
    }

    // Always show posts interface
    return (
        <div className="min-h-screen">
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-brand">OutboxLive</div>
                    <div className="page-header-actions">
                        {token ? (
                            <button
                                onClick={() => { const redirectTo = logout(); navigate(redirectTo); }}
                                className="btn btn-secondary"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn btn-primary"
                                >
                                    Login
                                </button>

                                <button
                                    onClick={() => navigate('/register')}
                                    className="btn btn-primary"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="page-introduction">
                    <h1>Community Posts</h1>
                    <p>Share your thoughts and engage with the community</p>
                </div>

                {error && !token ? (
                    // Show error only if we had a token but got an error
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
                ) : !token && posts.length === 0 && !error ? (
                    // Show login prompt when no token and no posts (expected case)
                    <div className="w-full max-w-md space-y-6">
                        <h3 className="text-center text-primary mb-4">Welcome to PostCRD</h3>
                        <p className="text-muted text-center">
                            Please log in to view and participate in the community discussion
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white font-medium rounded-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-lg focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-primary"
                            >
                                Login to Continue
                            </button>
                            <p className="text-center text-sm text-muted">
                                Don't have an account? <a href="/register" className="text-primary hover:underline">Register</a>
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="posts-feed">
                            {posts.length === 0 ? (
                                <div className="text-center py-12">
                                    <h3 className="text-primary mb-4">No posts yet</h3>
                                    <p className="text-muted">
                                        Be the first to share a post and start the conversation
                                    </p>
                                    {token ? (
                                        <button
                                            onClick={() => navigate('/posts/new')}
                                            className="btn btn-primary"
                                        >
                                            Create First Post
                                        </button>
                                    ) : (
                                        <p className="text-muted mt-4">
                                            Please log in to create posts
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {posts.map((post) => (
                                        <PostCard key={post._id} post={post} />
                                    ))}
                                </>
                            )}
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

export default HomePage;