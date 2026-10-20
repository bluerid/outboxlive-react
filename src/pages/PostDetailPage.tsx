import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import CommentSection from '../components/CommentSection';

const PostDetailPage: React.FC = () => {
    const { token, user, logout, loading: authLoading }: { token: string | null; user: any; logout: () => string; loading: boolean } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            setLoading(true);
            setError(null);
            setPost(null);
            return;
        }
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/posts/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        const redirectTo = logout();
                        navigate(redirectTo);
                        return;
                    }
                    if (response.status === 404) {
                        setError('Post not found');
                        setLoading(false);
                        return;
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch post');
                }

                const data = await response.json();
                setPost(data);
                console.log('Post data:', data); // DEBUG
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [token, logout, navigate, id, authLoading]);

    if (loading) {
        return (
            <div className="min-h-screen bg-accent flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-primary">Loading post...</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-accent flex items-center justify-center">
                <div className="w-full max-w-md space-y-6">
                    <h3 className="text-center text-primary mb-4">Error Loading Post</h3>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/posts')}
                            className="btn btn-primary"
                        >
                            Back to Posts
                        </button>
                        {token && (
                            <button
                                onClick={() => { const redirectTo = logout(); navigate(redirectTo); }}
                                className="btn btn-secondary"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-accent flex items-center justify-center">
                <div className="w-full max-w-md space-y-6">
                    <h3 className="text-center text-primary mb-4">Post Not Found</h3>
                    <p className="text-muted text-center">
                        The post you're looking for doesn't exist or has been removed.
                    </p>
                    <button
                        onClick={() => navigate('/posts')}
                        className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white font-medium rounded-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-lg focus:outline-none focus:ring-2 focus-ring-offset-2 focus-ring-primary"
                    >
                        Back to Posts
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-brand">OutboxLive</div>
                    <div className="page-header-actions">
                        <button
                            onClick={() => navigate('/posts')}
                            className="btn btn-primary"
                        >
                            Back to Posts
                        </button>
                        {user && post.author && user.id === post.author._id && (
                            <button
                                onClick={() => navigate('/posts/edit/' + id)}
                                className="btn btn-secondary"
                            >
                                Edit Post
                            </button>
                        )}
                        {token && (
                            <button
                                onClick={() => { const redirectTo = logout(); navigate(redirectTo); }}
                                className="btn btn-secondary"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>

                <div className="page-introduction">
                    {post.title && (
                        <h1>{post.title}</h1>
                    )}
                    {post.createdAt && (
                        <span>
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    )}
                </div>

                <div className="card">
                    <div className="card-body">
                        {post.content && (
                            <div className="post-feed-card-excerpt">
                                {post.content.replace(/\n/g, '<br>')}
                            </div>
                        )}
                        <div className="post-feed-card-author">
                            {post.author && (
                                <span className="mr-4">
                                    By <span>{post.author.name || 'Unknown'}</span>
                                </span>
                            )}

                        </div>
                    </div>
                </div>


                <CommentSection postId={id} token={token} user={user} />
            </div>
        </div>
    );
};

export default PostDetailPage;