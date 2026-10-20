import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const PostFormPage: React.FC = () => {
    const { token, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<{ title: string; content: string }>({
        title: '',
        content: '',
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isEdit, setIsEdit] = useState<boolean>(false);

    useEffect(() => {
        if (authLoading) {
            setLoading(true);
            setError(null);
            setPost({ title: '', content: '' });
            setIsEdit(false);
            return;
        }
        if (!token) {
            navigate('/login');
            return;
        }

        if (id) {
            // Edit mode: fetch existing post
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
                            // TODO: handle logout
                            navigate('/login');
                            return;
                        }
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to fetch post');
                    }

                    const data = await response.json();
                    setPost({
                        title: data.title || '',
                        content: data.content || '',
                    });
                    setIsEdit(true);
                } catch (err: any) {
                    setError(err.message || 'An unexpected error occurred');
                } finally {
                    setLoading(false);
                }
            };

            fetchPost();
        } else {
            setIsEdit(false);
        }
    }, [token, id, navigate, authLoading]);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let response;
            if (isEdit && id) {
                // Update existing post
                response = await fetch(`/api/posts/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: post.title,
                        content: post.content,
                    }),
                });
            } else {
                // Create new post
                response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: post.title,
                        content: post.content,
                    }),
                });
            }

            if (!response.ok) {
                if (response.status === 401) {
                    // TODO: handle logout
                    navigate('/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save post');
            }

            // Redirect to posts list on success
            navigate('/posts');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-accent flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-primary">{isEdit ? 'Updating post...' : 'Creating post...'}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="page-container">
                <div className="page-header">
                    <div className="page-header-brand">OutboxLive</div>
                    <h6 className="text-2xl font-bold text-primary">
                        {isEdit ? 'Edit Post' : 'Create New Post'}
                    </h6>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 px-4 py-4 mb-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            value={post.title}
                            onChange={(e) => setPost({ ...post, title: e.target.value })}
                            className="form-input"
                            placeholder="Enter post title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Content</label>
                        <textarea
                            value={post.content}
                            onChange={(e) => setPost({ ...post, content: e.target.value })}
                            className="form-input"
                            rows={8}
                            placeholder="Share your thoughts..."
                            required
                        />
                    </div>

                    <div className="flex justify-start">
                        <button
                            type="button"
                            onClick={() => navigate('/posts')}
                            className="flex items-center justify-center btn btn-outline btn-md mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center justify-center btn btn-primary btn-md"
                        >
                            {isEdit ? 'Update Post' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostFormPage;