import { useState, useEffect } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { Post, User, Comment } from '@/types';
import { postsAPI } from '@/lib/api';

interface FollowingPageProps {
  user: User;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: number) => void;
  onTagClick?: (tag: string) => void;
  onFollowToggle?: () => void;
}

export function FollowingPage({
  user,
  onEditPost,
  onDeletePost,
  onTagClick,
  onFollowToggle
}: FollowingPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { posts } = await postsAPI.getPosts({ feed: 'following' });
      setPosts(posts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки постов');
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCommentAdded = (postId: number, comment: Comment) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments_count: post.comments_count + 1,
              comments: [...(post.comments || []), comment]
            }
          : post
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h1 className="font-bold mb-4">Лента подписок</h1>
        <p className="text-gray-500">Посты от пользователей, на которых вы подписаны</p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка постов...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Нет постов от подписок. Подпишитесь на интересных авторов!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              onEdit={onEditPost}
              onDelete={onDeletePost}
              onTagClick={onTagClick}
              onCommentAdded={handleCommentAdded}
              onFollowToggle={onFollowToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
} 