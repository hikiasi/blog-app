import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PostCard } from '@/components/posts/PostCard';
import { Post, User, Comment } from '@/types';
import { postsAPI, followAPI } from '@/lib/api';

interface ProfilePageProps {
  user: User;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: number) => void;
  onTagClick?: (tag: string) => void;
  onCreatePost?: () => void;
}

export function ProfilePage({
  user,
  onEditPost,
  onDeletePost,
  onTagClick,
  onCreatePost
}: ProfilePageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ following: 0, followers: 0 });

  const fetchUserPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { posts } = await postsAPI.getPosts({ author: user.username });
      setPosts(posts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки постов');
      console.error('Error fetching user posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const stats = await followAPI.getUserStats(user.id);
      setStats(stats);
    } catch (err: any) {
      console.error('Error fetching user stats:', err);
    }
  };

  useEffect(() => {
    fetchUserPosts();
    fetchUserStats();
  }, [user.username, user.id]);

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
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarFallback className="text-xl">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <h2 className="font-semibold mb-2">{user?.username}</h2>
          
          <div className="flex gap-4 justify-center mb-4">
            <div className="text-center">
              <div className="font-semibold">
                {posts.length}
              </div>
              <div className="text-gray-500">Постов</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{stats.following}</div>
              <div className="text-gray-500">Подписок</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{stats.followers}</div>
              <div className="text-gray-500">Подписчиков</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-4">Мои посты</h3>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            У вас пока нет постов. 
            <Button variant="link" onClick={onCreatePost} className="ml-2">
              Создать первый пост
            </Button>
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
                onFollowToggle={fetchUserStats}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 