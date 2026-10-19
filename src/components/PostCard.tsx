import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
    post: {
        _id: string;
        title: string;
        content: string;
        author?: {
            name: string;
        };
        createdAt?: string;
    };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const authorName = post.author?.name || 'Unknown';
    const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '';
    const navigate = useNavigate();

    const handleViewMore = () => {
        navigate(`/posts/${post._id}`);
    };

    return (
        <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="card-body">
                <h3 className="card-title text-primary">{post.title}</h3>
                <p className="card-content text-muted mb-4">
                    {post.content}
                </p>
                <div className="flex text-sm text-muted mb-3">
                    <span className="mr-4">By {authorName}</span>
                    <span>{date}</span>
                </div>
                <button
                    onClick={handleViewMore}
                    className="w-full text-left text-primary underline hover:no-underline"
                >
                    View More →
                </button>
            </div>
        </div>
    );
};

export default PostCard;