import React, { useEffect, useState } from 'react';

interface CommentSectionProps {
    postId: string | undefined;
    token: string | null;
    user: { id: string; name?: string } | null;
}

const CommentSection: React.FC<CommentSectionProps> = ({
    postId,
    token,
    user,
}) => {
    const [comments, setComments] = useState<any[]>([]);
    const [commentLoading, setCommentLoading] = useState<boolean>(false);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState<string>('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<string>('');

    useEffect(() => {
        if (!postId || !token) return;
        const fetchComments = async () => {
            setCommentLoading(true);
            setCommentError(null);
            try {
                const response = await fetch(`/api/posts/${postId}/comments`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }

                const data = await response.json();
                setComments(Array.isArray(data) ? data : data.comments || []);
            } catch (err: any) {
                setCommentError(err.message || 'An unexpected error occurred');
            } finally {
                setCommentLoading(false);
            }
        };

        fetchComments();
    }, [postId, token]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setCommentLoading(true);
        setCommentError(null);
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment.trim() }),
            });

            if (!response.ok) {
                throw new Error('Failed to create comment');
            }

            const newCommentData = await response.json();
            setComments(prev => [newCommentData, ...prev]); // prepend
            setNewComment('');
        } catch (err: any) {
            setCommentError(err.message || 'An unexpected error occurred');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleCommentEdit = async (commentId: string) => {
        if (!editContent.trim()) return;
        setCommentLoading(true);
        setCommentError(null);
        try {
            const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: editContent.trim() }),
            });

            if (!response.ok) {
                throw new Error('Failed to update comment');
            }

            const updatedComment = await response.json();
            setComments(prev =>
                prev.map(comment => (comment._id === commentId ? updatedComment : comment))
            );
            setEditingCommentId(null);
            setEditContent('');
        } catch (err: any) {
            setCommentError(err.message || 'An unexpected error occurred');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleCommentDelete = async (commentId: string) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        setCommentLoading(true);
        setCommentError(null);
        try {
            const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            setComments(prev => prev.filter(comment => comment._id !== commentId));
        } catch (err: any) {
            setCommentError(err.message || 'An unexpected error occurred');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleCommentCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent('');
    };

    if (commentLoading && commentError === null) {
        return <p className="text-center text-muted">Loading comments...</p>;
    }

    if (commentError && !commentLoading) {
        return <p className="text-center text-red-600">{commentError}</p>;
    }

    return (
        <>
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            {!commentLoading && comments.length > 0 && (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <div key={comment._id} className="border p-4 rounded-lg bg-gray-50">
                            <div className="flex items-start space-x-3">
                                {/* Comment author avatar/initial */}
                                <div className="flex-shrink-0 h-10 w-10 bg-primary text-white flex items-center justify-center rounded-full text-sm font-medium">
                                    {comment.user?.name?.[0]?.toUpperCase() ?? 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <span className="font-medium text-gray-800">{comment.user?.name || 'Anonymous'}</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700">{comment.content}</p>
                                    {/* Edit controls */}
                                    {token && comment.user && user?.id === comment.user._id && (
                                        <div className="mt-2 flex items-center space-x-2">
                                            {editingCommentId === comment._id ? (
                                                <>
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="border border-gray-300 rounded p-2 w-full resize-y min-h-[80px]"
                                                        rows={2}
                                                        placeholder="Edit comment..."
                                                    />
                                                    <div className="flex justify-end mt-2 space-x-2">
                                                        <button
                                                            onClick={() => handleCommentEdit(comment._id)}
                                                            className="btn btn-secondary"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={handleCommentCancelEdit}
                                                            className="btn btn-outline"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCommentId(comment._id);
                                                            setEditContent(comment.content);
                                                        }}
                                                        className="btn btn-outline btn-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleCommentDelete(comment._id)}
                                                        className="btn btn-outline btn-sm text-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Add Comment Form */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Add a comment</h3>
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="border border-gray-300 rounded p-2 w-full resize-y min-h-[80px]"
                        rows={3}
                        placeholder="Write your comment..."
                    ></textarea>
                    {commentLoading && (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={!newComment.trim() || commentLoading}
                        className={`btn btn-primary w-full ${!newComment.trim() || commentLoading ? 'opacity-50' : ''}`}
                    >
                        {commentLoading ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            </div>
            {/* Conditionally show "No comments yet" message */}
            {!commentLoading && comments.length === 0 && (
                <p className="text-center text-muted">No comments yet.</p>
            )}
        </>
    );
};

export default CommentSection;