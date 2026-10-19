import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PostFeedCardProps {
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

const PostFeedCard: React.FC<PostFeedCardProps> = ({ post }) => {
    const authorName = post.author?.name || 'Unknown';
    const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '';
    const navigate = useNavigate();

    const handleReadPost = () => {
        navigate(`/posts/${post._id}`);
    };

    // Truncate content to a reasonable length for the excerpt
    const excerpt = post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content;

    return (
        <div className="post-feed-card">
            <div className="post-feed-card-content">
                <h3 className="post-feed-card-title">{post.title}</h3>
                <p className="post-feed-card-excerpt">{excerpt}</p>
                <div className="post-feed-card-meta">
                    <span className="post-feed-card-author">By {authorName}</span>
                    <span className="post-feed-card-date">{date}</span>
                </div>
                <button
                    onClick={handleReadPost}
                    className="post-feed-card-read-post"
                >
                    Read post
                </button>
            </div>
        </div>
    );
};

export default PostFeedCard;