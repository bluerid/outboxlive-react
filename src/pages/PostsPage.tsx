import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PostFeedCard from '../components/PostFeedCard';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PostsPage: React.FC = () => {
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
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch posts');
                }

                const data = await response.json().catch(() => ({}));
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

    if (loading) {
        return (
            <div className="min-h-screen bg-accent flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-primary">Loading your posts...</h3>
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
                <div className="page-header">
                    <div className="page-header-brand">
                        OutboxLive
                    </div>
                    <div className="page-header-actions">
                        <button
                            onClick={() => navigate('/posts/new')}
                            className="btn btn-primary"
                        >
                            Create Post
                        </button>
                        <button
                            onClick={() => { logout(); }}
                            className="btn btn-secondary"
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <div className="page-introduction">
                    <h1>OutboxLive</h1>
                    <p>Share your thoughts and connect with the community</p>
                </div>
                <div className="posts-feed">
                    {posts.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-primary mb-4">No posts yet</h3>
                            <p className="text-muted">
                                Start by sharing your first post to begin your journey
                            </p>
                            <button
                                onClick={() => navigate('/posts/new')}
                                className="btn btn-primary"
                            >
                                Create First Post
                            </button>
                        </div>
                    ) : (
                        <>
                            {posts.map((post) => (
                                <PostFeedCard key={post._id} post={post} />
                            ))}
                        </>
                    )}
                </div>
                {pagination && (
                    <div className="pagination mt-4">
                        <button
                            onClick={() => {
                                const newPage = Math.max(page - 1, 1);
                                navigate(`/posts?page=${newPage}`);
                            }}
                            disabled={page <= 1}
                            className="btn btn-primary"
                        >
                            Previous
                        </button>
                        <span className="pagination-info">
                            Page {page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => {
                                const newPage = Math.min(page + 1, pagination.totalPages);
                                navigate(`/posts?page=${newPage}`);
                            }}
                            disabled={page >= pagination.totalPages}
                            className="btn btn-primary"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostsPage;